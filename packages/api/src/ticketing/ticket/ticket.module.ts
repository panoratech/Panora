import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './services/ticket.service';
import { SyncTicketsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';

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
    ZendeskService,
    LoggerService,
    SyncTicketsService,
    WebhookService,
    EncryptionService,
  ],
  exports: [SyncTicketsService],
})
export class TicketModule {}
