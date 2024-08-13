import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '../types/model.unified';
import { OriginalOrderOutput } from '@@core/utils/types/original/original.ecommerce';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { ServiceRegistry } from './registry.service';
import { IOrderService } from '../types';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { EcommerceObject } from '@ecommerce/@lib/@types';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
    private webhook: WebhookService,
  ) {
    this.logger.setContext(OrderService.name);
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async validateCustomerId(id?: string) {
    if (id) {
      const res = await this.prisma.ecom_customers.findUnique({
        where: { id_ecom_customer: id },
      });
      if (!res)
        throw new ReferenceError(
          'You inserted a cusotmer_id which does not exist',
        );
    }
  }

  async addOrder(
    unifiedEcommerceOrderData: UnifiedEcommerceOrderInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceOrderOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateCustomerId(unifiedEcommerceOrderData.customer_id);

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedEcommerceOrderInput>({
          sourceObject: unifiedEcommerceOrderData,
          targetType: EcommerceObject.order,
          providerName: integrationId,
          vertical: 'ecommerce',
          customFieldMappings: [],
        });

      const service: IOrderService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalOrderOutput> = await service.addOrder(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalOrderOutput[]
      >({
        sourceObject: [resp.data],
        targetType: EcommerceObject.order,
        providerName: integrationId,
        vertical: 'ecommerce',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedEcommerceOrderOutput[];

      const source_order = resp.data;
      const target_order = unifiedObject[0];

      const unique_ecommerce_order_id = await this.saveOrUpdateOrder(
        target_order,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_ecommerce_order_id,
        source_order,
      );

      const result_order = await this.getOrder(
        unique_ecommerce_order_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'ecommerce.order.push',
          method: 'POST',
          url: '/ecommerce/companies',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_order,
        'ecommerce.order.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_order;
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateOrder(
    order: UnifiedEcommerceOrderOutput,
    connection_id: string,
  ): Promise<string> {
    const existingOrder = await this.prisma.ecom_orders.findFirst({
      where: { remote_id: order.remote_id, id_connection: connection_id },
    });

    const data: any = {
      order_status: order.order_status,
      order_number: order.order_number,
      payment_status: order.payment_status,
      currency: order.currency,
      total_price: order.total_price,
      total_discount: order.total_discount,
      total_shipping: order.total_shipping,
      total_tax: order.total_tax,
      fulfillment_status: order.fulfillment_status,
      id_ecom_customer: order.customer_id,
      modified_at: new Date(),
    };

    if (existingOrder) {
      const res = await this.prisma.ecom_orders.update({
        where: { id_ecom_order: existingOrder.id_ecom_order },
        data: data,
      });

      return res.id_ecom_order;
    } else {
      data.created_at = new Date();
      data.remote_id = order.remote_id;
      data.id_connection = connection_id;
      data.id_ecom_order = uuidv4();

      const newOrder = await this.prisma.ecom_orders.create({ data: data });

      return newOrder.id_ecom_order;
    }
  }

  async getOrder(
    id_ecom_order: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceOrderOutput> {
    try {
      const order = await this.prisma.ecom_orders.findUnique({
        where: {
          id_ecom_order: id_ecom_order,
        },
      });

      if (!order) {
        throw new Error(`Order with ID ${id_ecom_order} not found.`);
      }

      // Fetch field mappings for the order
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: order.id_ecom_order,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedEcommerceOrderOutput format
      const UnifiedEcommerceOrder: UnifiedEcommerceOrderOutput = {
        id: order.id_ecom_order,
        order_status: order.order_status,
        order_number: order.order_number,
        payment_status: order.payment_status,
        currency: order.currency as CurrencyCode,
        total_price: Number(order.total_price),
        total_discount: Number(order.total_discount),
        total_shipping: Number(order.total_shipping),
        total_tax: Number(order.total_tax),
        fulfillment_status: order.fulfillment_status,
        customer_id: order.id_ecom_customer,
        field_mappings: field_mappings,
        remote_id: order.remote_id,
        created_at: order.created_at.toISOString(),
        modified_at: order.modified_at.toISOString(),
      };

      let res: UnifiedEcommerceOrderOutput = UnifiedEcommerceOrder;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: order.id_ecom_order,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.order.pull',
          method: 'GET',
          url: '/ecommerce/order',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getOrders(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedEcommerceOrderOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ecom_orders.findFirst({
          where: {
            id_connection: connection_id,
            id_ecom_order: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const orders = await this.prisma.ecom_orders.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ecom_order: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (orders.length === limit + 1) {
        next_cursor = Buffer.from(
          orders[orders.length - 1].id_ecom_order,
        ).toString('base64');
        orders.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const UnifiedEcommerceOrders: UnifiedEcommerceOrderOutput[] =
        await Promise.all(
          orders.map(async (order) => {
            // Fetch field mappings for the order
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: order.id_ecom_order,
                },
              },
              include: {
                attribute: true,
              },
            });

            // Create a map to store unique field mappings
            const fieldMappingsMap = new Map();

            values.forEach((value) => {
              fieldMappingsMap.set(value.attribute.slug, value.data);
            });

            // Convert the map to an array of objects
            const field_mappings = Object.fromEntries(fieldMappingsMap);

            // Transform to UnifiedEcommerceOrderOutput format
            return {
              id: order.id_ecom_order,
              order_status: order.order_status,
              order_number: order.order_number,
              payment_status: order.payment_status,
              currency: order.currency as CurrencyCode,
              total_price: Number(order.total_price),
              total_discount: Number(order.total_discount),
              total_shipping: Number(order.total_shipping),
              total_tax: Number(order.total_tax),
              fulfillment_status: order.fulfillment_status,
              customer_id: order.id_ecom_customer,
              field_mappings: field_mappings,
              remote_id: order.remote_id,
              created_at: order.created_at.toISOString(),
              modified_at: order.modified_at.toISOString(),
            };
          }),
        );

      let res: UnifiedEcommerceOrderOutput[] = UnifiedEcommerceOrders;

      if (remote_data) {
        const remote_array_data: UnifiedEcommerceOrderOutput[] =
          await Promise.all(
            res.map(async (order) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: order.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...order, remote_data };
            }),
          );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.order.pull',
          method: 'GET',
          url: '/ecommerce/orders',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
