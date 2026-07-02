import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { QueueService } from './queue.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private queueService;
    private prisma;
    private wsAuthGuard;
    server: Server;
    private readonly logger;
    constructor(queueService: QueueService, prisma: PrismaService, wsAuthGuard: WsAuthGuard);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinSlot(client: Socket, slotId: string): Promise<void>;
    handleLeaveSlot(client: Socket, slotId: string): Promise<void>;
}
