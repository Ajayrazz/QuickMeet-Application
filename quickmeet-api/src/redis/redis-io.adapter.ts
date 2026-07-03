import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRedisClient } from '../config/redis.config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: any;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const configService = this.app.get(ConfigService);
    const redisUrl =
      configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    // We instantiate two separate clients using the factory so BOTH get the 
    // critical 'error' listeners attached, preventing unhandled exceptions.
    const pubClient = createRedisClient(redisUrl, 'SocketIO-Pub');
    const subClient = createRedisClient(redisUrl, 'SocketIO-Sub');

    await Promise.all([
      new Promise<void>((resolve) => {
        pubClient.once('ready', () => resolve());
      }),
      new Promise<void>((resolve) => {
        subClient.once('ready', () => resolve());
      }),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
