import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalJournalEntryOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_journal_entries as AccJournalEntry } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IJournalEntryService } from '../types';
import {
  LineItem,
  UnifiedAccountingJournalentryOutput,
} from '../types/model.unified';
import { CurrencyCode } from '@@core/utils/types';

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
    this.registry.registerService('accounting', 'journalentry', this);
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
      const service: IJournalEntryService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingJournalentryOutput,
        OriginalJournalEntryOutput,
        IJournalEntryService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'journal_entry',
        service,
        [],
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    journalEntries: UnifiedAccountingJournalentryOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccJournalEntry[]> {
    try {
      const journalEntryResults: AccJournalEntry[] = [];

      for (let i = 0; i < journalEntries.length; i++) {
        const journalEntry = journalEntries[i];
        const originId = journalEntry.remote_id;

        let existingJournalEntry =
          await this.prisma.acc_journal_entries.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const journalEntryData = {
          transaction_date: journalEntry.transaction_date,
          payments: journalEntry.payments,
          applied_payments: journalEntry.applied_payments,
          memo: journalEntry.memo,
          currency: journalEntry.currency as CurrencyCode,
          exchange_rate: journalEntry.exchange_rate,
          id_acc_company_info: journalEntry.id_acc_company_info,
          journal_number: journalEntry.journal_number,
          tracking_categories: journalEntry.tracking_categories,
          id_acc_accounting_period: journalEntry.id_acc_accounting_period,
          posting_status: journalEntry.posting_status,
          remote_created_at: journalEntry.remote_created_at,
          remote_modiified_at: journalEntry.remote_modiified_at,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingJournalEntry) {
          existingJournalEntry = await this.prisma.acc_journal_entries.update({
            where: {
              id_acc_journal_entry: existingJournalEntry.id_acc_journal_entry,
            },
            data: journalEntryData,
          });
        } else {
          existingJournalEntry = await this.prisma.acc_journal_entries.create({
            data: {
              ...journalEntryData,
              id_acc_journal_entry: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        journalEntryResults.push(existingJournalEntry);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          journalEntry.field_mappings,
          existingJournalEntry.id_acc_journal_entry,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingJournalEntry.id_acc_journal_entry,
          remote_data[i],
        );

        // Handle line items
        if (journalEntry.line_items && journalEntry.line_items.length > 0) {
          await this.processJournalEntryLineItems(
            existingJournalEntry.id_acc_journal_entry,
            journalEntry.line_items,
          );
        }
      }

      return journalEntryResults;
    } catch (error) {
      throw error;
    }
  }

  private async processJournalEntryLineItems(
    journalEntryId: string,
    lineItems: LineItem[],
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        net_amount: lineItem.net_amount ? Number(lineItem.net_amount) : null,
        tracking_categories: lineItem.tracking_categories,
        currency: lineItem.currency as CurrencyCode,
        description: lineItem.description,
        company: lineItem.company,
        contact: lineItem.contact,
        exchange_rate: lineItem.exchange_rate,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_acc_journal_entry: journalEntryId,
      };

      const existingLineItem =
        await this.prisma.acc_journal_entries_lines.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_journal_entry: journalEntryId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_journal_entries_lines.update({
          where: {
            id_acc_journal_entries_line:
              existingLineItem.id_acc_journal_entries_line,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_journal_entries_lines.create({
          data: {
            ...lineItemData,
            id_acc_journal_entries_line: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_journal_entries_lines.deleteMany({
      where: {
        id_acc_journal_entry: journalEntryId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
