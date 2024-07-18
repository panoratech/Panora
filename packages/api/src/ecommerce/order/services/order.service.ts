import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedOrderOutput } from '../types/model.unified';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(OrderService.name);
  }

  async getOrder(
    id_ecom_order: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedOrderOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedOrderOutput format
      const unifiedOrder: UnifiedOrderOutput = {
        id: order.id_ecom_order,
        name: order.name,
        field_mappings: field_mappings,
        remote_id: order.remote_id,
        created_at: order.created_at,
        modified_at: order.modified_at,
      };

      let res: UnifiedOrderOutput = unifiedOrder;
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
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedOrderOutput[];
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

      const unifiedOrders: UnifiedOrderOutput[] = await Promise.all(
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
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedOrderOutput format
          return {
            id: order.id_ecom_order,
            name: order.name,
            field_mappings: field_mappings,
            remote_id: order.remote_id,
            created_at: order.created_at,
            modified_at: order.modified_at,
          };
        }),
      );

      let res: UnifiedOrderOutput[] = unifiedOrders;

      if (remote_data) {
        const remote_array_data: UnifiedOrderOutput[] = await Promise.all(
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
