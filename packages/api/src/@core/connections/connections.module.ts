import { Module } from '@nestjs/common';
import { ConnectionsService } from './services/connections.service';
import { ConnectionsController } from './connections.controller';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
})
export class ConnectionsModule {}
