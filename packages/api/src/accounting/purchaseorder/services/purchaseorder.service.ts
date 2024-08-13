import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedAccountingPurchaseorderInput,
  UnifiedAccountingPurchaseorderOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PurchaseOrderService.name);
  }

  async addPurchaseOrder(
    unifiedPurchaseOrderData: UnifiedAccountingPurchaseorderInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPurchaseorderOutput> {
    try {
      const service = this.serviceRegistry.getService(integrationId);
      const resp = await service.addPurchaseOrder(
        unifiedPurchaseOrderData,
        linkedUserId,
      );

      const savedPurchaseOrder = await this.prisma.acc_purchase_orders.create({
        data: {
          id_acc_purchase_order: uuidv4(),
          ...unifiedPurchaseOrderData,
          total_amount: unifiedPurchaseOrderData.total_amount
            ? Number(unifiedPurchaseOrderData.total_amount)
            : null,
          remote_id: resp.data.remote_id,
          id_connection: connection_id,
          created_at: new Date(),
          modified_at: new Date(),
        },
      });

      // Save line items
      if (unifiedPurchaseOrderData.line_items) {
        await Promise.all(
          unifiedPurchaseOrderData.line_items.map(async (lineItem) => {
            await this.prisma.acc_purchase_orders_line_items.create({
              data: {
                id_acc_purchase_orders_line_item: uuidv4(),
                id_acc_purchase_order: savedPurchaseOrder.id_acc_purchase_order,
                ...lineItem,
                unit_price: lineItem.unit_price
                  ? Number(lineItem.unit_price)
                  : null,
                quantity: lineItem.quantity ? Number(lineItem.quantity) : null,
                tax_amount: lineItem.tax_amount
                  ? Number(lineItem.tax_amount)
                  : null,
                total_line_amount: lineItem.total_line_amount
                  ? Number(lineItem.total_line_amount)
                  : null,
                created_at: new Date(),
                modified_at: new Date(),
              },
            });
          }),
        );
      }

      const result: UnifiedAccountingPurchaseorderOutput = {
        ...savedPurchaseOrder,
        currency: savedPurchaseOrder.currency as CurrencyCode,
        id: savedPurchaseOrder.id_acc_purchase_order,
        total_amount: savedPurchaseOrder.total_amount
          ? Number(savedPurchaseOrder.total_amount)
          : undefined,
        line_items: unifiedPurchaseOrderData.line_items,
      };

      if (remote_data) {
        result.remote_data = resp.data;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getPurchaseOrder(
    id_acc_purchase_order: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAccountingPurchaseorderOutput> {
    try {
      const purchaseOrder = await this.prisma.acc_purchase_orders.findUnique({
        where: { id_acc_purchase_order: id_acc_purchase_order },
      });

      if (!purchaseOrder) {
        throw new Error(
          `Purchase order with ID ${id_acc_purchase_order} not found.`,
        );
      }

      const lineItems =
        await this.prisma.acc_purchase_orders_line_items.findMany({
          where: { id_acc_purchase_order: id_acc_purchase_order },
        });

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: purchaseOrder.id_acc_purchase_order },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedPurchaseOrder: UnifiedAccountingPurchaseorderOutput = {
        id: purchaseOrder.id_acc_purchase_order,
        status: purchaseOrder.status,
        issue_date: purchaseOrder.issue_date,
        purchase_order_number: purchaseOrder.purchase_order_number,
        delivery_date: purchaseOrder.delivery_date,
        delivery_address: purchaseOrder.delivery_address,
        customer: purchaseOrder.customer,
        vendor: purchaseOrder.vendor,
        memo: purchaseOrder.memo,
        company_id: purchaseOrder.company,
        total_amount: purchaseOrder.total_amount
          ? Number(purchaseOrder.total_amount)
          : undefined,
        currency: purchaseOrder.currency as CurrencyCode,
        exchange_rate: purchaseOrder.exchange_rate,
        tracking_categories: purchaseOrder.tracking_categories,
        accounting_period_id: purchaseOrder.id_acc_accounting_period,
        field_mappings: field_mappings,
        remote_id: purchaseOrder.remote_id,
        remote_created_at: purchaseOrder.remote_created_at,
        remote_updated_at: purchaseOrder.remote_updated_at,
        created_at: purchaseOrder.created_at,
        modified_at: purchaseOrder.modified_at,
        line_items: lineItems.map((item) => ({
          id: item.id_acc_purchase_orders_line_item,
          description: item.description,
          unit_price: item.unit_price ? Number(item.unit_price) : undefined,
          quantity: item.quantity ? Number(item.quantity) : undefined,
          tracking_categories: item.tracking_categories,
          tax_amount: item.tax_amount ? Number(item.tax_amount) : undefined,
          total_line_amount: item.total_line_amount
            ? Number(item.total_line_amount)
            : undefined,
          currency: item.currency as CurrencyCode,
          exchange_rate: item.exchange_rate,
          id_acc_account: item.id_acc_account,
          id_acc_company: item.id_acc_company,
          remote_id: item.remote_id,
          created_at: item.created_at,
          modified_at: item.modified_at,
        })),
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: purchaseOrder.id_acc_purchase_order },
        });
        unifiedPurchaseOrder.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.purchase_order.pull',
          method: 'GET',
          url: '/accounting/purchase_order',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedPurchaseOrder;
    } catch (error) {
      throw error;
    }
  }

  async getPurchaseOrders(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedAccountingPurchaseorderOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const purchaseOrders = await this.prisma.acc_purchase_orders.findMany({
        take: limit + 1,
        cursor: cursor ? { id_acc_purchase_order: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = purchaseOrders.length > limit;
      if (hasNextPage) purchaseOrders.pop();

      const unifiedPurchaseOrders = await Promise.all(
        purchaseOrders.map(async (purchaseOrder) => {
          const lineItems =
            await this.prisma.acc_purchase_orders_line_items.findMany({
              where: {
                id_acc_purchase_order: purchaseOrder.id_acc_purchase_order,
              },
            });

          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: purchaseOrder.id_acc_purchase_order,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedPurchaseOrder: UnifiedAccountingPurchaseorderOutput = {
            id: purchaseOrder.id_acc_purchase_order,
            status: purchaseOrder.status,
            issue_date: purchaseOrder.issue_date,
            purchase_order_number: purchaseOrder.purchase_order_number,
            delivery_date: purchaseOrder.delivery_date,
            delivery_address: purchaseOrder.delivery_address,
            customer: purchaseOrder.customer,
            vendor: purchaseOrder.vendor,
            memo: purchaseOrder.memo,
            company_id: purchaseOrder.company,
            total_amount: purchaseOrder.total_amount
              ? Number(purchaseOrder.total_amount)
              : undefined,
            currency: purchaseOrder.currency as CurrencyCode,
            exchange_rate: purchaseOrder.exchange_rate,
            tracking_categories: purchaseOrder.tracking_categories,
            accounting_period_id: purchaseOrder.id_acc_accounting_period,
            field_mappings: field_mappings,
            remote_id: purchaseOrder.remote_id,
            remote_created_at: purchaseOrder.remote_created_at,
            remote_updated_at: purchaseOrder.remote_updated_at,
            created_at: purchaseOrder.created_at,
            modified_at: purchaseOrder.modified_at,
            line_items: lineItems.map((item) => ({
              id: item.id_acc_purchase_orders_line_item,
              description: item.description,
              unit_price: item.unit_price ? Number(item.unit_price) : undefined,
              quantity: item.quantity ? Number(item.quantity) : undefined,
              tracking_categories: item.tracking_categories,
              tax_amount: item.tax_amount ? Number(item.tax_amount) : undefined,
              total_line_amount: item.total_line_amount
                ? Number(item.total_line_amount)
                : undefined,
              currency: item.currency as CurrencyCode,
              exchange_rate: item.exchange_rate,
              id_acc_account: item.id_acc_account,
              id_acc_company: item.id_acc_company,
              remote_id: item.remote_id,
              created_at: item.created_at,
              modified_at: item.modified_at,
            })),
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: purchaseOrder.id_acc_purchase_order,
              },
            });
            unifiedPurchaseOrder.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedPurchaseOrder;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'accounting.purchase_order.pull',
          method: 'GET',
          url: '/accounting/purchase_orders',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedPurchaseOrders,
        next_cursor: hasNextPage
          ? purchaseOrders[purchaseOrders.length - 1].id_acc_purchase_order
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
