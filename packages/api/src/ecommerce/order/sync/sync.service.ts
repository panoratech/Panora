import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalOrderOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ECOMMERCE_PROVIDERS } from '@panora/shared';
import { ecom_orders as EcommerceOrder } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IOrderService } from '../types';
import { UnifiedEcommerceOrderOutput } from '../types/model.unified';

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
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ecommerce', 'order', this);
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
          const providers = ECOMMERCE_PROVIDERS;
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
      const service: IOrderService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedEcommerceOrderOutput,
        OriginalOrderOutput,
        IOrderService
      >(integrationId, linkedUserId, 'ecommerce', 'order', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    orders: UnifiedEcommerceOrderOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<EcommerceOrder[]> {
    try {
      const orders_results: EcommerceOrder[] = [];

      const updateOrCreateOrder = async (
        order: UnifiedEcommerceOrderOutput,
        originId: string,
      ) => {
        let existingOrder;
        if (!originId) {
          existingOrder = await this.prisma.ecom_orders.findFirst({
            where: {
              order_number: order.order_number,
              id_connection: connection_id,
            },
          });
        } else {
          existingOrder = await this.prisma.ecom_orders.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          order_status: order.order_status ?? null,
          order_number: order.order_number ?? null,
          payment_status: order.payment_status ?? null,
          currency: order.currency ?? null,
          total_price: order.total_price ?? null,
          total_discount: order.total_discount ?? null,
          total_shipping: order.total_shipping ?? null,
          total_tax: order.total_tax ?? null,
          fulfillment_status: order.fulfillment_status ?? null,
          id_ecom_customer: order.customer_id ?? null,
          modified_at: new Date(),
        };

        if (existingOrder) {
          return await this.prisma.ecom_orders.update({
            where: {
              id_ecom_order: existingOrder.id_ecom_order,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ecom_orders.create({
            data: {
              ...baseData,
              id_ecom_order: uuidv4(),
              created_at: new Date(),
              remote_deleted: false,
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const originId = order.remote_id;

        const res = await updateOrCreateOrder(order, originId);
        const order_id = res.id_ecom_order;
        orders_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          order.field_mappings,
          order_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(order_id, remote_data[i]);
      }

      return orders_results;
    } catch (error) {
      throw error;
    }
  }
}
