import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalInvoiceOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_invoices as AccInvoice } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IInvoiceService } from '../types';
import {
  LineItem,
  UnifiedAccountingInvoiceOutput,
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
    this.registry.registerService('accounting', 'invoice', this);
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
      const service: IInvoiceService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingInvoiceOutput,
        OriginalInvoiceOutput,
        IInvoiceService
      >(integrationId, linkedUserId, 'accounting', 'invoice', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    invoices: UnifiedAccountingInvoiceOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccInvoice[]> {
    try {
      const invoiceResults: AccInvoice[] = [];

      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];
        const originId = invoice.remote_id;

        let existingInvoice = await this.prisma.acc_invoices.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const invoiceData = {
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
            : null,
          sub_total: invoice.sub_total ? Number(invoice.sub_total) : null,
          status: invoice.status,
          total_tax_amount: invoice.total_tax_amount
            ? Number(invoice.total_tax_amount)
            : null,
          total_amount: invoice.total_amount
            ? Number(invoice.total_amount)
            : null,
          balance: invoice.balance ? Number(invoice.balance) : null,
          remote_updated_at: invoice.remote_updated_at,
          remote_id: originId,
          id_acc_contact: invoice.contact_id,
          id_acc_accounting_period: invoice.accounting_period_id,
          tracking_categories: invoice.tracking_categories,
          modified_at: new Date(),
        };

        if (existingInvoice) {
          existingInvoice = await this.prisma.acc_invoices.update({
            where: { id_acc_invoice: existingInvoice.id_acc_invoice },
            data: invoiceData,
          });
        } else {
          existingInvoice = await this.prisma.acc_invoices.create({
            data: {
              ...invoiceData,
              id_acc_invoice: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        invoiceResults.push(existingInvoice);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          invoice.field_mappings,
          existingInvoice.id_acc_invoice,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingInvoice.id_acc_invoice,
          remote_data[i],
        );

        // Handle line items
        if (invoice.line_items && invoice.line_items.length > 0) {
          await this.processInvoiceLineItems(
            existingInvoice.id_acc_invoice,
            invoice.line_items,
            connection_id,
          );
        }
      }

      return invoiceResults;
    } catch (error) {
      throw error;
    }
  }

  private async processInvoiceLineItems(
    invoiceId: string,
    lineItems: LineItem[],
    connectionId: string,
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        description: lineItem.description,
        unit_price: lineItem.unit_price ? Number(lineItem.unit_price) : null,
        quantity: lineItem.quantity ? Number(lineItem.quantity) : null,
        total_amount: lineItem.total_amount
          ? Number(lineItem.total_amount)
          : null,
        currency: lineItem.currency as CurrencyCode,
        exchange_rate: lineItem.exchange_rate,
        id_acc_invoice: invoiceId,
        id_acc_item: lineItem.item_id,
        acc_tracking_categories: lineItem.tracking_categories,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_connection: connectionId,
      };

      const existingLineItem =
        await this.prisma.acc_invoices_line_items.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_invoice: invoiceId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_invoices_line_items.update({
          where: {
            id_acc_invoices_line_item:
              existingLineItem.id_acc_invoices_line_item,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_invoices_line_items.create({
          data: {
            ...lineItemData,
            id_acc_invoices_line_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_invoices_line_items.deleteMany({
      where: {
        id_acc_invoice: invoiceId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
