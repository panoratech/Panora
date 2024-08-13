import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { throwTypedError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  UnifiedAccountingCreditnoteInput,
  UnifiedAccountingCreditnoteOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CreditNoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CreditNoteService.name);
  }

  async getCreditNote(
    id_acc_credit_note: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingCreditnoteOutput> {
    try {
      const creditNote = await this.prisma.acc_credit_notes.findUnique({
        where: { id_acc_credit_note: id_acc_credit_note },
      });

      if (!creditNote) {
        throw new Error(`Credit note with ID ${id_acc_credit_note} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: creditNote.id_acc_credit_note },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedCreditNote: UnifiedAccountingCreditnoteOutput = {
        id: creditNote.id_acc_credit_note,
        transaction_date: creditNote.transaction_date?.toISOString(),
        status: creditNote.status,
        number: creditNote.number,
        contact_id: creditNote.id_acc_contact,
        company_id: creditNote.company,
        exchange_rate: creditNote.exchange_rate,
        total_amount: creditNote.total_amount
          ? Number(creditNote.total_amount)
          : undefined,
        remaining_credit: creditNote.remaining_credit
          ? Number(creditNote.remaining_credit)
          : undefined,
        tracking_categories: creditNote.tracking_categories,
        currency: creditNote.currency as CurrencyCode,
        payments: creditNote.payments,
        applied_payments: creditNote.applied_payments,
        accounting_period_id: creditNote.id_acc_accounting_period,
        field_mappings: field_mappings,
        remote_id: creditNote.remote_id,
        remote_created_at: creditNote.remote_created_at,
        remote_updated_at: creditNote.remote_updated_at,
        created_at: creditNote.created_at,
        modified_at: creditNote.modified_at,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: creditNote.id_acc_credit_note },
        });
        unifiedCreditNote.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.credit_note.pull',
          method: 'GET',
          url: '/accounting/credit_note',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedCreditNote;
    } catch (error) {
      throw error;
    }
  }

  async getCreditNotes(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingCreditnoteOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const creditNotes = await this.prisma.acc_credit_notes.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_credit_note: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = creditNotes.length > limit;
      if (hasNextPage) creditNotes.pop();

      const unifiedCreditNotes = await Promise.all(
        creditNotes.map(async (creditNote) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: creditNote.id_acc_credit_note },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedCreditNote: UnifiedAccountingCreditnoteOutput = {
            id: creditNote.id_acc_credit_note,
            transaction_date: creditNote.transaction_date?.toISOString(),
            status: creditNote.status,
            number: creditNote.number,
            contact_id: creditNote.id_acc_contact,
            company_id: creditNote.company,
            exchange_rate: creditNote.exchange_rate,
            total_amount: creditNote.total_amount
              ? Number(creditNote.total_amount)
              : undefined,
            remaining_credit: creditNote.remaining_credit
              ? Number(creditNote.remaining_credit)
              : undefined,
            tracking_categories: creditNote.tracking_categories,
            currency: creditNote.currency as CurrencyCode,
            payments: creditNote.payments,
            applied_payments: creditNote.applied_payments,
            accounting_period_id: creditNote.id_acc_accounting_period,
            field_mappings: field_mappings,
            remote_id: creditNote.remote_id,
            remote_created_at: creditNote.remote_created_at,
            remote_updated_at: creditNote.remote_updated_at,
            created_at: creditNote.created_at,
            modified_at: creditNote.modified_at,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: creditNote.id_acc_credit_note },
            });
            unifiedCreditNote.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedCreditNote;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.credit_note.pull',
          method: 'GET',
          url: '/accounting/credit_notes',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedCreditNotes,
        next_cursor: hasNextPage
          ? creditNotes[creditNotes.length - 1].id_acc_credit_note
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
