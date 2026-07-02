import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);
    
    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      // Logic from Phase 1 JWT validation
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, isVerified: true },
      });

      if (!user) {
        throw new WsException('Unauthorized');
      }

      // Attach user to socket
      (client as any).user = user;
      
    } catch (error) {
      this.logger.error('WebSocket Auth Error', error);
      throw new WsException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const token = client.handshake.auth?.token;
    if (typeof token === 'string') {
      return token;
    }
    return undefined;
  }
}
