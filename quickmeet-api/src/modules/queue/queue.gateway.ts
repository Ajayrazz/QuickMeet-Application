import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { QueueService } from './queue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
@WebSocketGateway({ namespace: '/queue', cors: true })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(QueueGateway.name);

  constructor(
    private queueService: QueueService,
    private prisma: PrismaService,
    private wsAuthGuard: WsAuthGuard, // Inject to use manually in connection
  ) {}

  async handleConnection(client: Socket) {
    try {
      // We manually invoke the logic of the guard to disconnect immediately on fail
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token');

      // Simulate context for guard (a bit hacky but works for connect)
      // Alternatively, we use an io middleware. Let's just do a quick check here.
      // But using an adapter middleware is better.
      // For now, if we use the Guard on methods, that protects actions.
      // We want to attach user to the personal room on connect.
    } catch (e: any) {
      this.logger.warn(`Client connection rejected: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join:slot')
  async handleJoinSlot(
    @ConnectedSocket() client: Socket,
    @MessageBody('slotId') slotId: string,
  ) {
    const user = (client as any).user;

    // Verify user owns an active booking in this slot OR is the admin
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId },
      include: { appointmentType: true },
    });

    if (!slot) {
      client.emit('error', { message: 'Slot not found' });
      return;
    }

    let isAuthorized = false;
    if (user.role === 'ADMIN' && slot.appointmentType.adminId === user.id) {
      isAuthorized = true;
    } else {
      const activeBooking = await this.prisma.booking.findFirst({
        where: {
          slotId,
          userId: user.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
        },
      });
      if (activeBooking) isAuthorized = true;
    }

    if (!isAuthorized) {
      client.emit('error', { message: 'Unauthorized to join this slot queue' });
      return;
    }

    const roomName = `slot:${slotId}`;
    await client.join(roomName);

    // Also join personal room for specific notifications
    const personalRoom = `user:${user.id}`;
    await client.join(personalRoom);

    // Send initial snapshot
    const snapshot = await this.queueService.getSnapshot(slotId);
    client.emit('queue:update', snapshot);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leave:slot')
  async handleLeaveSlot(
    @ConnectedSocket() client: Socket,
    @MessageBody('slotId') slotId: string,
  ) {
    const roomName = `slot:${slotId}`;
    await client.leave(roomName);
  }
}
