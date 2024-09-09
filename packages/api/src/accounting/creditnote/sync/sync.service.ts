import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingCreditnoteOutput } from '../types/model.unified';
import { ICreditNoteService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_credit_notes as AccCreditNote } from '@prisma/client';
import { OriginalCreditNoteOutput } from '@@core/utils/types/original/original.accounting';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('accounting', 'creditnote', this);
  }
  onModuleInit() {
    //
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = ACCOUNTING_PROVIDERS;
          for (const provider of providers) {
            try {
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ICreditNoteService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingCreditnoteOutput,
        OriginalCreditNoteOutput,
        ICreditNoteService
      >(integrationId, linkedUserId, 'accounting', 'credit_note', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    creditNotes: UnifiedAccountingCreditnoteOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccCreditNote[]> {
    try {
      const creditNoteResults: AccCreditNote[] = [];

      for (let i = 0; i < creditNotes.length; i++) {
        const creditNote = creditNotes[i];
        const originId = creditNote.remote_id;

        let existingCreditNote = await this.prisma.acc_credit_notes.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const creditNoteData = {
          transaction_date: creditNote.transaction_date
            ? new Date(creditNote.transaction_date)
            : null,
          status: creditNote.status,
          number: creditNote.number,
          id_acc_contact: creditNote.contact_id,
          company: creditNote.company_id,
          exchange_rate: creditNote.exchange_rate,
          total_amount: creditNote.total_amount
            ? Number(creditNote.total_amount)
            : null,
          remaining_credit: creditNote.remaining_credit
            ? Number(creditNote.remaining_credit)
            : null,
          tracking_categories: creditNote.tracking_categories,
          currency: creditNote.currency as CurrencyCode,
          payments: creditNote.payments,
          applied_payments: creditNote.applied_payments,
          id_acc_accounting_period: creditNote.accounting_period_id,
          remote_id: originId,
          remote_created_at: creditNote.remote_created_at,
          remote_updated_at: creditNote.remote_updated_at,
          modified_at: new Date(),
        };

        if (existingCreditNote) {
          existingCreditNote = await this.prisma.acc_credit_notes.update({
            where: {
              id_acc_credit_note: existingCreditNote.id_acc_credit_note,
            },
            data: creditNoteData,
          });
        } else {
          existingCreditNote = await this.prisma.acc_credit_notes.create({
            data: {
              ...creditNoteData,
              id_acc_credit_note: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        creditNoteResults.push(existingCreditNote);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          creditNote.field_mappings,
          existingCreditNote.id_acc_credit_note,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingCreditNote.id_acc_credit_note,
          remote_data[i],
        );
      }

      return creditNoteResults;
    } catch (error) {
      throw error;
    }
  }
}
