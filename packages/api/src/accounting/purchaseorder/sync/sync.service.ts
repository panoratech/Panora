import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalPurchaseOrderOutput } from '@@core/utils/types/original/original.accounting';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_purchase_orders as AccPurchaseOrder } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IPurchaseOrderService } from '../types';
import {
  LineItem,
  UnifiedAccountingPurchaseorderOutput,
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
    this.registry.registerService('accounting', 'purchaseorder', this);
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
      const service: IPurchaseOrderService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingPurchaseorderOutput,
        OriginalPurchaseOrderOutput,
        IPurchaseOrderService
      >(
        integrationId,
        linkedUserId,
        'accounting',
        'purchase_order',
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
    purchaseOrders: UnifiedAccountingPurchaseorderOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccPurchaseOrder[]> {
    try {
      const purchaseOrderResults: AccPurchaseOrder[] = [];

      for (let i = 0; i < purchaseOrders.length; i++) {
        const purchaseOrder = purchaseOrders[i];
        const originId = purchaseOrder.remote_id;

        let existingPurchaseOrder =
          await this.prisma.acc_purchase_orders.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const purchaseOrderData = {
          status: purchaseOrder.status,
          issue_date: purchaseOrder.issue_date,
          purchase_order_number: purchaseOrder.purchase_order_number,
          delivery_date: purchaseOrder.delivery_date,
          delivery_address: purchaseOrder.delivery_address,
          customer: purchaseOrder.customer,
          vendor: purchaseOrder.vendor,
          memo: purchaseOrder.memo,
          company: purchaseOrder.company_id,
          total_amount: purchaseOrder.total_amount
            ? Number(purchaseOrder.total_amount)
            : null,
          currency: purchaseOrder.currency as CurrencyCode,
          exchange_rate: purchaseOrder.exchange_rate,
          tracking_categories: purchaseOrder.tracking_categories,
          remote_created_at: purchaseOrder.remote_created_at,
          remote_updated_at: purchaseOrder.remote_updated_at,
          id_acc_accounting_period: purchaseOrder.accounting_period_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingPurchaseOrder) {
          existingPurchaseOrder = await this.prisma.acc_purchase_orders.update({
            where: {
              id_acc_purchase_order:
                existingPurchaseOrder.id_acc_purchase_order,
            },
            data: purchaseOrderData,
          });
        } else {
          existingPurchaseOrder = await this.prisma.acc_purchase_orders.create({
            data: {
              ...purchaseOrderData,
              id_acc_purchase_order: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        purchaseOrderResults.push(existingPurchaseOrder);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          purchaseOrder.field_mappings,
          existingPurchaseOrder.id_acc_purchase_order,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingPurchaseOrder.id_acc_purchase_order,
          remote_data[i],
        );

        // Handle line items
        if (purchaseOrder.line_items && purchaseOrder.line_items.length > 0) {
          await this.processPurchaseOrderLineItems(
            existingPurchaseOrder.id_acc_purchase_order,
            purchaseOrder.line_items,
          );
        }
      }

      return purchaseOrderResults;
    } catch (error) {
      throw error;
    }
  }

  private async processPurchaseOrderLineItems(
    purchaseOrderId: string,
    lineItems: LineItem[],
  ): Promise<void> {
    for (const lineItem of lineItems) {
      const lineItemData = {
        description: lineItem.description,
        unit_price: lineItem.unit_price ? Number(lineItem.unit_price) : null,
        quantity: lineItem.quantity ? Number(lineItem.quantity) : null,
        tracking_categories: lineItem.tracking_categories || [],
        tax_amount: lineItem.tax_amount ? Number(lineItem.tax_amount) : null,
        total_line_amount: lineItem.total_line_amount
          ? Number(lineItem.total_line_amount)
          : null,
        currency: lineItem.currency as CurrencyCode,
        exchange_rate: lineItem.exchange_rate,
        id_acc_account: lineItem.account_id,
        id_acc_company: lineItem.company_id,
        remote_id: lineItem.remote_id,
        modified_at: new Date(),
        id_acc_purchase_order: purchaseOrderId,
      };

      const existingLineItem =
        await this.prisma.acc_purchase_orders_line_items.findFirst({
          where: {
            remote_id: lineItem.remote_id,
            id_acc_purchase_order: purchaseOrderId,
          },
        });

      if (existingLineItem) {
        await this.prisma.acc_purchase_orders_line_items.update({
          where: {
            id_acc_purchase_orders_line_item:
              existingLineItem.id_acc_purchase_orders_line_item,
          },
          data: lineItemData,
        });
      } else {
        await this.prisma.acc_purchase_orders_line_items.create({
          data: {
            ...lineItemData,
            id_acc_purchase_orders_line_item: uuidv4(),
            created_at: new Date(),
          },
        });
      }
    }

    // Remove any existing line items that are not in the current set
    const currentRemoteIds = lineItems.map((item) => item.remote_id);
    await this.prisma.acc_purchase_orders_line_items.deleteMany({
      where: {
        id_acc_purchase_order: purchaseOrderId,
        remote_id: {
          notIn: currentRemoteIds,
        },
      },
    });
  }
}
