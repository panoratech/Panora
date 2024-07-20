import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedFulfillmentOrdersOutput } from '../types/model.unified';

@Injectable()
export class FulfillmentOrdersService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(FulfillmentOrdersService.name);
  }

  /*async getFulfillmentOrders(
    id_ecommerce_fulfillmentorders: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFulfillmentOrdersOutput> {
    try {
      const fulfillmentorders =
        await this.prisma.ecommerce_fulfillmentorderss.findUnique({
          where: {
            id_ecommerce_fulfillmentorders: id_ecommerce_fulfillmentorders,
          },
        });

      if (!fulfillmentorders) {
        throw new Error(
          `FulfillmentOrders with ID ${id_ecommerce_fulfillmentorders} not found.`,
        );
      }

      // Fetch field mappings for the fulfillmentorders
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id:
              fulfillmentorders.id_ecommerce_fulfillmentorders,
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

      // Transform to UnifiedFulfillmentOrdersOutput format
      const unifiedFulfillmentOrders: UnifiedFulfillmentOrdersOutput = {
        id: fulfillmentorders.id_ecommerce_fulfillmentorders,
        name: fulfillmentorders.name,
        field_mappings: field_mappings,
        remote_id: fulfillmentorders.remote_id,
        created_at: fulfillmentorders.created_at,
        modified_at: fulfillmentorders.modified_at,
      };

      let res: UnifiedFulfillmentOrdersOutput = unifiedFulfillmentOrders;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id:
              fulfillmentorders.id_ecommerce_fulfillmentorders,
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
          type: 'ecommerce.fulfillmentorders.pull',
          method: 'GET',
          url: '/ecommerce/fulfillmentorders',
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

  async getFulfillmentOrderss(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFulfillmentOrdersOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent =
          await this.prisma.ecommerce_fulfillmentorderss.findFirst({
            where: {
              id_connection: connection_id,
              id_ecommerce_fulfillmentorders: cursor,
            },
          });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const fulfillmentorderss =
        await this.prisma.ecommerce_fulfillmentorderss.findMany({
          take: limit + 1,
          cursor: cursor
            ? {
                id_ecommerce_fulfillmentorders: cursor,
              }
            : undefined,
          orderBy: {
            created_at: 'asc',
          },
          where: {
            id_connection: connection_id,
          },
        });

      if (fulfillmentorderss.length === limit + 1) {
        next_cursor = Buffer.from(
          fulfillmentorderss[fulfillmentorderss.length - 1]
            .id_ecommerce_fulfillmentorders,
        ).toString('base64');
        fulfillmentorderss.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedFulfillmentOrderss: UnifiedFulfillmentOrdersOutput[] =
        await Promise.all(
          fulfillmentorderss.map(async (fulfillmentorders) => {
            // Fetch field mappings for the fulfillmentorders
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id:
                    fulfillmentorders.id_ecommerce_fulfillmentorders,
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

            // Transform to UnifiedFulfillmentOrdersOutput format
            return {
              id: fulfillmentorders.id_ecommerce_fulfillmentorders,
              name: fulfillmentorders.name,
              field_mappings: field_mappings,
              remote_id: fulfillmentorders.remote_id,
              created_at: fulfillmentorders.created_at,
              modified_at: fulfillmentorders.modified_at,
            };
          }),
        );

      let res: UnifiedFulfillmentOrdersOutput[] = unifiedFulfillmentOrderss;

      if (remote_data) {
        const remote_array_data: UnifiedFulfillmentOrdersOutput[] =
          await Promise.all(
            res.map(async (fulfillmentorders) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: fulfillmentorders.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...fulfillmentorders, remote_data };
            }),
          );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ecommerce.fulfillmentorders.pull',
          method: 'GET',
          url: '/ecommerce/fulfillmentorderss',
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
  }*/
}
