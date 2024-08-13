import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingPaymentInput,
  UnifiedAccountingPaymentOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  async addPayment(
    unifiedPaymentData: UnifiedAccountingPaymentInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPaymentOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addPayment(unifiedPaymentData, linkedUserId);

      const savedPayment = await this.prisma.acc_payments.create({
        data: {
          id_acc_payment: uuidv4(),
          ...unifiedPaymentData,
          total_amount: unifiedPaymentData.total_amount
            ? Number(unifiedPaymentData.total_amount)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      // Save line items
      if (unifiedPaymentData.line_items) {
        await Promise.all(
          unifiedPaymentData.line_items.map(async (lineItem) => {
            await this.prisma.acc_payments_line_items.create({
              data: {
                acc_payments_line_item: uuidv4(),
                id_acc_payment: savedPayment.id_acc_payment,
                ...lineItem,
                applied_amount: lineItem.applied_amount
                  ? Number(lineItem.applied_amount)
                  : null,
                created_at: new Date(),
                modified_at: new Date(),
                id_connection: connection_id,
              },
            });
          }),
        );
      }

      const result: UnifiedAccountingPaymentOutput = {
        ...savedPayment,
        currency: savedPayment.currency as CurrencyCode,
        id: savedPayment.id_acc_payment,
        total_amount: savedPayment.total_amount
          ? Number(savedPayment.total_amount)
          : undefined,
        line_items: unifiedPaymentData.line_items,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getPayment(
    id_acc_payment: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPaymentOutput> {
    try {
      const payment = await this.prisma.acc_payments.findUnique({
        where: { id_acc_payment: id_acc_payment },
      });

      if (!payment) {
        throw new Error(`Payment with ID ${id_acc_payment} not found.`);
      }

      const lineItems = await this.prisma.acc_payments_line_items.findMany({
        where: { id_acc_payment: id_acc_payment },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: payment.id_acc_payment },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedPayment: UnifiedAccountingPaymentOutput = {
        id: payment.id_acc_payment,
        invoice_id: payment.id_acc_invoice,
        transaction_date: payment.transaction_date,
        contact_id: payment.id_acc_contact,
        account_id: payment.id_acc_account,
        currency: payment.currency as CurrencyCode,
        exchange_rate: payment.exchange_rate,
        total_amount: payment.total_amount
          ? Number(payment.total_amount)
          : undefined,
        type: payment.type,
        company_info_id: payment.id_acc_company_info,
        accounting_period_id: payment.id_acc_accounting_period,
        tracking_categories: payment.tracking_categories,
        field_mappings: field_mappings,
        remote_id: payment.remote_id,
        remote_updated_at: payment.remote_updated_at,
        created_at: payment.created_at,
        modified_at: payment.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.acc_payments_line_item,
          applied_amount: item.applied_amount
            ? Number(item.applied_amount)
            : undefined,
          applied_date: item.applied_date,
          related_object_id: item.related_object_id,
          related_object_type: item.related_object_type,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: payment.id_acc_payment },
        });
        unifiedPayment.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.payment.pull',
          method: 'GET',
          url: '/accounting/payment',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedPayment;
    } catch (error) {
      throw error;
    }
  }

  async getPayments(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingPaymentOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const payments = await this.prisma.acc_payments.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_payment: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = payments.length > limit;
      if (hasNextPage) payments.pop();

      const unifiedPayments = await Promise.all(
        payments.map(async (payment) => {
          const lineItems = await this.prisma.acc_payments_line_items.findMany({
            where: { id_acc_payment: payment.id_acc_payment },
          });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: payment.id_acc_payment },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedPayment: UnifiedAccountingPaymentOutput = {
            id: payment.id_acc_payment,
            invoice_id: payment.id_acc_invoice,
            transaction_date: payment.transaction_date,
            contact_id: payment.id_acc_contact,
            account_id: payment.id_acc_account,
            currency: payment.currency as CurrencyCode,
            exchange_rate: payment.exchange_rate,
            total_amount: payment.total_amount
              ? Number(payment.total_amount)
              : undefined,
            type: payment.type,
            company_info_id: payment.id_acc_company_info,
            accounting_period_id: payment.id_acc_accounting_period,
            tracking_categories: payment.tracking_categories,
            field_mappings: field_mappings,
            remote_id: payment.remote_id,
            remote_updated_at: payment.remote_updated_at,
            created_at: payment.created_at,
            modified_at: payment.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.acc_payments_line_item,
              applied_amount: item.applied_amount
                ? Number(item.applied_amount)
                : undefined,
              applied_date: item.applied_date,
              related_object_id: item.related_object_id,
              related_object_type: item.related_object_type,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: payment.id_acc_payment },
            });
            unifiedPayment.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedPayment;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.payment.pull',
          method: 'GET',
          url: '/accounting/payments',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedPayments,
        next_cursor: hasNextPage
          ? payments[payments.length - 1].id_acc_payment
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
