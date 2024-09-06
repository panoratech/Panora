import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingInvoiceInput,
  UnifiedAccountingInvoiceOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(InvoiceService.name);
  }

  async addInvoice(
    unifiedInvoiceData: UnifiedAccountingInvoiceInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingInvoiceOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addInvoice(unifiedInvoiceData, linkedUserId);

      const savedInvoice = await this.prisma.acc_invoices.create({
        data: {
          id_acc_invoice: uuidv4(),
          ...unifiedInvoiceData,
          total_discount: unifiedInvoiceData.total_discount
            ? Number(unifiedInvoiceData.total_discount)
            : null,
          sub_total: unifiedInvoiceData.sub_total
            ? Number(unifiedInvoiceData.sub_total)
            : null,
          total_tax_amount: unifiedInvoiceData.total_tax_amount
            ? Number(unifiedInvoiceData.total_tax_amount)
            : null,
          total_amount: unifiedInvoiceData.total_amount
            ? Number(unifiedInvoiceData.total_amount)
            : null,
          balance: unifiedInvoiceData.balance
            ? Number(unifiedInvoiceData.balance)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      // Save line items
      if (unifiedInvoiceData.line_items) {
        await Promise.all(
          unifiedInvoiceData.line_items.map(async (lineItem) => {
            await this.prisma.acc_invoices_line_items.create({
              data: {
                id_acc_invoices_line_item: uuidv4(),
                id_acc_invoice: savedInvoice.id_acc_invoice,
                id_acc_item: uuidv4(),
                ...lineItem,
                unit_price: lineItem.unit_price
                  ? Number(lineItem.unit_price)
                  : null,
                quantity: lineItem.quantity ? Number(lineItem.quantity) : null,
                total_amount: lineItem.total_amount
                  ? Number(lineItem.total_amount)
                  : null,
                created_at: new Date(),
                modified_at: new Date(),
                id_connection: connection_id,
              },
            });
          }),
        );
      }

      const result: UnifiedAccountingInvoiceOutput = {
        ...savedInvoice,
        currency: savedInvoice.currency as CurrencyCode,
        id: savedInvoice.id_acc_invoice,
        total_discount: savedInvoice.total_discount
          ? Number(savedInvoice.total_discount)
          : undefined,
        sub_total: savedInvoice.sub_total
          ? Number(savedInvoice.sub_total)
          : undefined,
        total_tax_amount: savedInvoice.total_tax_amount
          ? Number(savedInvoice.total_tax_amount)
          : undefined,
        total_amount: savedInvoice.total_amount
          ? Number(savedInvoice.total_amount)
          : undefined,
        balance: savedInvoice.balance
          ? Number(savedInvoice.balance)
          : undefined,
        line_items: unifiedInvoiceData.line_items,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getInvoice(
    id_acc_invoice: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingInvoiceOutput> {
    try {
      const invoice = await this.prisma.acc_invoices.findUnique({
        where: { id_acc_invoice: id_acc_invoice },
      });

      if (!invoice) {
        throw new Error(`Invoice with ID ${id_acc_invoice} not found.`);
      }

      const lineItems = await this.prisma.acc_invoices_line_items.findMany({
        where: { id_acc_invoice: id_acc_invoice },
      });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: invoice.id_acc_invoice },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedInvoice: UnifiedAccountingInvoiceOutput = {
        id: invoice.id_acc_invoice,
        type: invoice.type,
        number: invoice.number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        paid_on_date: invoice.paid_on_date,
        memo: invoice.memo,
        currency: invoice.currency as CurrencyCode,
        exchange_rate: invoice.exchange_rate,
        total_discount: invoice.total_discount
          ? Number(invoice.total_discount)
          : undefined,
        sub_total: invoice.sub_total ? Number(invoice.sub_total) : undefined,
        status: invoice.status,
        total_tax_amount: invoice.total_tax_amount
          ? Number(invoice.total_tax_amount)
          : undefined,
        total_amount: invoice.total_amount
          ? Number(invoice.total_amount)
          : undefined,
        balance: invoice.balance ? Number(invoice.balance) : undefined,
        contact_id: invoice.id_acc_contact,
        accounting_period_id: invoice.id_acc_accounting_period,
        tracking_categories: invoice.tracking_categories,
        field_mappings: field_mappings,
        remote_id: invoice.remote_id,
        remote_updated_at: invoice.remote_updated_at,
        created_at: invoice.created_at,
        modified_at: invoice.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.id_acc_invoices_line_item,
          description: item.description,
          unit_price: item.unit_price ? Number(item.unit_price) : undefined,
          quantity: item.quantity ? Number(item.quantity) : undefined,
          total_amount: item.total_amount
            ? Number(item.total_amount)
            : undefined,
          currency: item.currency as CurrencyCode,
          exchange_rate: item.exchange_rate,
          id_acc_item: item.id_acc_item,
          acc_tracking_categories: item.acc_tracking_categories,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: invoice.id_acc_invoice },
        });
        unifiedInvoice.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.invoice.pull',
          method: 'GET',
          url: '/accounting/invoice',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedInvoice;
    } catch (error) {
      throw error;
    }
  }

  async getInvoices(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingInvoiceOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const invoices = await this.prisma.acc_invoices.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_invoice: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = invoices.length > limit;
      if (hasNextPage) invoices.pop();

      const unifiedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          const lineItems = await this.prisma.acc_invoices_line_items.findMany({
            where: { id_acc_invoice: invoice.id_acc_invoice },
          });

          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: invoice.id_acc_invoice },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedInvoice: UnifiedAccountingInvoiceOutput = {
            id: invoice.id_acc_invoice,
            type: invoice.type,
            number: invoice.number,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            paid_on_date: invoice.paid_on_date,
            memo: invoice.memo,
            currency: invoice.currency as CurrencyCode,
            exchange_rate: invoice.exchange_rate,
            total_discount: invoice.total_discount
              ? Number(invoice.total_discount)
              : undefined,
            sub_total: invoice.sub_total
              ? Number(invoice.sub_total)
              : undefined,
            status: invoice.status,
            total_tax_amount: invoice.total_tax_amount
              ? Number(invoice.total_tax_amount)
              : undefined,
            total_amount: invoice.total_amount
              ? Number(invoice.total_amount)
              : undefined,
            balance: invoice.balance ? Number(invoice.balance) : undefined,
            contact_id: invoice.id_acc_contact,
            accounting_period_id: invoice.id_acc_accounting_period,
            tracking_categories: invoice.tracking_categories,
            field_mappings: field_mappings,
            remote_id: invoice.remote_id,
            remote_updated_at: invoice.remote_updated_at,
            created_at: invoice.created_at,
            modified_at: invoice.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_invoices_line_item,
              description: item.description,
              unit_price: item.unit_price ? Number(item.unit_price) : undefined,
              quantity: item.quantity ? Number(item.quantity) : undefined,
              total_amount: item.total_amount
                ? Number(item.total_amount)
                : undefined,
              currency: item.currency as CurrencyCode,
              exchange_rate: item.exchange_rate,
              id_acc_item: item.id_acc_item,
              acc_tracking_categories: item.acc_tracking_categories,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: invoice.id_acc_invoice },
            });
            unifiedInvoice.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedInvoice;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.invoice.pull',
          method: 'GET',
          url: '/accounting/invoices',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedInvoices,
        next_cursor: hasNextPage
          ? invoices[invoices.length - 1].id_acc_invoice
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
