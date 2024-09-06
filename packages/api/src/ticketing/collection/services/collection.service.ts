import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import {
  CollectionType,
  UnifiedTicketingCollectionOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class CollectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(CollectionService.name);
  }
  async getCollection(
    id_ticketing_collection: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingCollectionOutput> {
    try {
      const collection = await this.prisma.tcg_collections.findUnique({
        where: {
          id_tcg_collection: id_ticketing_collection,
        },
      });

      // Transform to UnifiedTicketingCollectionOutput format
      const unifiedCollection: UnifiedTicketingCollectionOutput = {
        id: collection.id_tcg_collection,
        name: collection.name,
        description: collection.description,
        collection_type: collection.collection_type,
        remote_id: collection.remote_id,
        created_at: collection.created_at,
        modified_at: collection.modified_at,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: collection.id_tcg_collection,
          },
        });
        const remote_data = JSON.parse(resp.data);

        unifiedCollection.remote_data = remote_data;
      }
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.collection.pull',
          method: 'GET',
          url: '/ticketing/collection',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return unifiedCollection;
    } catch (error) {
      throw error;
    }
  }

  async getCollections(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTicketingCollectionOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_collections.findFirst({
          where: {
            id_connection: connection_id,
            id_tcg_collection: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const collections = await this.prisma.tcg_collections.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_collection: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (collections.length === limit + 1) {
        next_cursor = Buffer.from(
          collections[collections.length - 1].id_tcg_collection,
        ).toString('base64');
        collections.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedCollections: UnifiedTicketingCollectionOutput[] =
        await Promise.all(
          collections.map(async (collection) => {
            return {
              id: collection.id_tcg_collection,
              name: collection.name,
              description: collection.description,
              collection_type: collection.collection_type,
              remote_id: collection.remote_id,
              created_at: collection.created_at,
              modified_at: collection.modified_at,
            };
          }),
        );

      let res: UnifiedTicketingCollectionOutput[] = unifiedCollections;

      if (remote_data) {
        const remote_array_data: UnifiedTicketingCollectionOutput[] =
          await Promise.all(
            res.map(async (collection) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: collection.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...collection, remote_data };
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
          type: 'ticketing.collection.pulled',
          method: 'GET',
          url: '/ticketing/collections',
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
