import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QueueGateway } from './queue.gateway';
import { QueueService } from './queue.service';
import { QueueEventsListener } from './queue-events.listener';
import { WsAuthGuard } from './ws-auth.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [QueueGateway, QueueService, QueueEventsListener, WsAuthGuard],
  exports: [QueueService],
})
export class QueueModule {}
