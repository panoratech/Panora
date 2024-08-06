import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedEcommerceFulfillmentOutput } from '../types/model.unified';

@Injectable()
export class FulfillmentService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(FulfillmentService.name);
  }

  async getFulfillment(
    id_ecom_fulfilment: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedEcommerceFulfillmentOutput> {
    try {
      const fulfillment = await this.prisma.ecom_fulfilments.findUnique({
        where: {
          id_ecom_fulfilment: id_ecom_fulfilment,
        },
      });

      if (!fulfillment) {
        throw new Error(`Fulfillment with ID ${id_ecom_fulfilment} not found.`);
      }

      // Fetch field mappings for the fulfillment
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: fulfillment.id_ecom_fulfilment,
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

      // Transform to UnifiedEcommerceFulfillmentOutput format
      const UnifiedEcommerceFulfillment: UnifiedEcommerceFulfillmentOutput = {
        id: fulfillment.id_ecom_fulfilment,
        carrier: fulfillment.carrier,
        tracking_urls: fulfillment.tracking_urls,
        tracking_numbers: fulfillment.tracking_numbers,
        items: fulfillment.items as Record<any, string>,
        field_mappings: field_mappings,
        remote_id: fulfillment.remote_id,
        order_id: fulfillment.id_ecom_order,
        created_at: fulfillment.created_at.toISOString(),
        modified_at: fulfillment.modified_at.toISOString(),
      };

      let res: UnifiedEcommerceFulfillmentOutput = UnifiedEcommerceFulfillment;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: fulfillment.id_ecom_fulfilment,
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
          type: 'ecommerce.fulfillment.pull',
          method: 'GET',
          url: '/ecommerce/fulfillment',
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

  async getFulfillments(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedEcommerceFulfillmentOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ecom_fulfilments.findFirst({
          where: {
            id_connection: connection_id,
            id_ecom_fulfilment: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const fulfillments = await this.prisma.ecom_fulfilments.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ecom_fulfilment: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (fulfillments.length === limit + 1) {
        next_cursor = Buffer.from(
          fulfillments[fulfillments.length - 1].id_ecom_fulfilment,
        ).toString('base64');
        fulfillments.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const UnifiedEcommerceFulfillments: UnifiedEcommerceFulfillmentOutput[] = await Promise.all(
        fulfillments.map(async (fulfillment) => {
          // Fetch field mappings for the fulfillment
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: fulfillment.id_ecom_fulfilment,
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

          // Transform to UnifiedEcommerceFulfillmentOutput format
          return {
            id: fulfillment.id_ecom_fulfilment,
            carrier: fulfillment.carrier,
            tracking_urls: fulfillment.tracking_urls,
            tracking_numbers: fulfillment.tracking_numbers,
            items: fulfillment.items as Record<any, string>,
            order_id: fulfillment.id_ecom_order,
            field_mappings: field_mappings,
            remote_id: fulfillment.remote_id,
            created_at: fulfillment.created_at.toISOString(),
            modified_at: fulfillment.modified_at.toISOString(),
          };
        }),
      );

      let res: UnifiedEcommerceFulfillmentOutput[] = UnifiedEcommerceFulfillments;

      if (remote_data) {
        const remote_array_data: UnifiedEcommerceFulfillmentOutput[] = await Promise.all(
          res.map(async (fulfillment) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: fulfillment.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...fulfillment, remote_data };
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
          type: 'ecommerce.fulfillment.pull',
          method: 'GET',
          url: '/ecommerce/fulfillments',
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
