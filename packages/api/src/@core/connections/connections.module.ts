import { Module } from '@nestjs/common';
import { ConnectionsService } from './services/connections.service';
import { ConnectionsController } from './connections.controller';
import { CrmConnectionsService } from './services/crm/crm-connection.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ConnectionsController],
  providers: [ConnectionsService, CrmConnectionsService, PrismaService],
})
export class ConnectionsModule {}
