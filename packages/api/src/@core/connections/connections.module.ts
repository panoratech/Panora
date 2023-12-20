import { Module } from '@nestjs/common';
import { CrmConnectionModule } from './crm/crm-connection.module';
import { ConnectionsController } from './connections.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';

@Module({
  controllers: [ConnectionsController],
  imports: [CrmConnectionModule],
  providers: [LoggerService, PrismaService],
  exports: [CrmConnectionModule],
})
export class ConnectionsModule {}
