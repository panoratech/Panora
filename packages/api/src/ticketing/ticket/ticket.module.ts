import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './services/ticket.service';
import { SyncTicketsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskTicketService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { TicketServiceRegistry } from './services/registry.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    PrismaService,
    ZendeskTicketService,
    LoggerService,
    SyncTicketsService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    TicketServiceRegistry,
  ],
  exports: [SyncTicketsService],
})
export class TicketModule {}
