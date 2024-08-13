import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingJournalentryInput,
  UnifiedAccountingJournalentryOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class JournalEntryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(JournalEntryService.name);
  }

  async addJournalEntry(
    unifiedJournalEntryData: UnifiedAccountingJournalentryInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingJournalentryOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addJournalEntry(
        unifiedJournalEntryData,
        linkedUserId,
      );

      const savedJournalEntry = await this.prisma.acc_journal_entries.create({
        data: {
          id_acc_journal_entry: uuidv4(),
          ...unifiedJournalEntryData,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      // Save line items
      if (unifiedJournalEntryData.line_items) {
        await Promise.all(
          unifiedJournalEntryData.line_items.map(async (lineItem) => {
            await this.prisma.acc_journal_entries_lines.create({
              data: {
                id_acc_journal_entries_line: uuidv4(),
                id_acc_journal_entry: savedJournalEntry.id_acc_journal_entry,
                ...lineItem,
                net_amount: lineItem.net_amount
                  ? Number(lineItem.net_amount)
                  : null,
                created_at: new Date(),
                modified_at: new Date(),
              },
            });
          }),
        );
      }

      const result: UnifiedAccountingJournalentryOutput = {
        ...savedJournalEntry,
        currency: savedJournalEntry.currency as CurrencyCode,
        id: savedJournalEntry.id_acc_journal_entry,
        line_items: unifiedJournalEntryData.line_items,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getJournalEntry(
    id_acc_journal_entry: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingJournalentryOutput> {
    try {
      const journalEntry = await this.prisma.acc_journal_entries.findUnique({
        where: { id_acc_journal_entry: id_acc_journal_entry },
      });

      if (!journalEntry) {
        throw new Error(
          `Journal entry with ID ${id_acc_journal_entry} not found.`,
        );
      }

      const lineItems = await this.prisma.acc_journal_entries_lines.findMany({
        where: { id_acc_journal_entry: id_acc_journal_entry },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: journalEntry.id_acc_journal_entry },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedJournalEntry: UnifiedAccountingJournalentryOutput = {
        id: journalEntry.id_acc_journal_entry,
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
        field_mappings: field_mappings,
        remote_id: journalEntry.remote_id,
        remote_created_at: journalEntry.remote_created_at,
        remote_modiified_at: journalEntry.remote_modiified_at,
        created_at: journalEntry.created_at,
        modified_at: journalEntry.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.id_acc_journal_entries_line,
          net_amount: item.net_amount ? Number(item.net_amount) : undefined,
          tracking_categories: item.tracking_categories,
          currency: item.currency as CurrencyCode,
          description: item.description,
          company: item.company,
          contact: item.contact,
          exchange_rate: item.exchange_rate,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: journalEntry.id_acc_journal_entry },
        });
        unifiedJournalEntry.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.journal_entry.pull',
          method: 'GET',
          url: '/accounting/journal_entry',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedJournalEntry;
    } catch (error) {
      throw error;
    }
  }

  async getJournalEntrys(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingJournalentryOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const journalEntries = await this.prisma.acc_journal_entries.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_journal_entry: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = journalEntries.length > limit;
      if (hasNextPage) journalEntries.pop();

      const unifiedJournalEntries = await Promise.all(
        journalEntries.map(async (journalEntry) => {
          const lineItems =
            await this.prisma.acc_journal_entries_lines.findMany({
              where: {
                id_acc_journal_entry: journalEntry.id_acc_journal_entry,
              },
            });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: journalEntry.id_acc_journal_entry },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedJournalEntry: UnifiedAccountingJournalentryOutput = {
            id: journalEntry.id_acc_journal_entry,
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
            field_mappings: field_mappings,
            remote_id: journalEntry.remote_id,
            remote_created_at: journalEntry.remote_created_at,
            remote_modiified_at: journalEntry.remote_modiified_at,
            created_at: journalEntry.created_at,
            modified_at: journalEntry.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_journal_entries_line,
              net_amount: item.net_amount ? Number(item.net_amount) : undefined,
              tracking_categories: item.tracking_categories,
              currency: item.currency as CurrencyCode,
              description: item.description,
              company: item.company,
              contact: item.contact,
              exchange_rate: item.exchange_rate,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: journalEntry.id_acc_journal_entry },
            });
            unifiedJournalEntry.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedJournalEntry;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.journal_entry.pull',
          method: 'GET',
          url: '/accounting/journal_entries',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedJournalEntries,
        next_cursor: hasNextPage
          ? journalEntries[journalEntries.length - 1].id_acc_journal_entry
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
