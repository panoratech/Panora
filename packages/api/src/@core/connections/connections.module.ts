import { Module } from '@nestjs/common';
import { CrmConnectionModule } from './crm/crm-connection.module';
import { ConnectionsController } from './connections.controller';
import { LoggerService } from '../logger/logger.service';

@Module({
  controllers: [ConnectionsController],
  imports: [CrmConnectionModule],
  providers: [LoggerService],
})
export class ConnectionsModule {}
