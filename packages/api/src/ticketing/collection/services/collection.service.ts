import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
<<<<<<< HEAD
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
=======
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
>>>>>>> 0a8f4472 (:ambulance: Errors fixing new format)
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedCollectionOutput } from '../types/model.unified';
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
    remote_data?: boolean,
  ): Promise<UnifiedCollectionOutput> {
    try {
      const collection = await this.prisma.tcg_collections.findUnique({
        where: {
          id_tcg_collection: id_ticketing_collection,
        },
      });

      // Transform to UnifiedCollectionOutput format
      const unifiedCollection: UnifiedCollectionOutput = {
        id: collection.id_tcg_collection,
        name: collection.name,
        description: collection.description,
        collection_type: collection.collection_type,
      };

      let res: UnifiedCollectionOutput = {
        ...unifiedCollection,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: collection.id_tcg_collection,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throwTypedError(new UnifiedTicketingError({
        name: "GET_COLLECTION_ERROR",
        message: "CollectionService.getCollection() call failed",
        cause: error
      }))
    }
  }

  async getCollections(
    integrationId: string,
    linkedUserId: string,
    pageSize: number,
    remote_data?: boolean,
    cursor?: string
  ): Promise<{ data: UnifiedCollectionOutput[], prev_cursor: null | string, next_cursor: null | string }> {
    try {

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_collections.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_collection: cursor
          }
        });
        if (!isCursorPresent) {
          throw new NotFoundError(`The provided cursor does not exist!`);
        }
      }

      let collections = await this.prisma.tcg_collections.findMany({
        take: pageSize + 1,
        cursor: cursor ? {
          id_tcg_collection: cursor
        } : undefined,
        orderBy: {
          created_at: 'asc'
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (collections.length === (pageSize + 1)) {
        next_cursor = Buffer.from(collections[collections.length - 1].id_tcg_collection).toString('base64');
        collections.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedCollections: UnifiedCollectionOutput[] = await Promise.all(
        collections.map(async (collection) => {
          return {
            id: collection.id_tcg_collection,
            name: collection.name,
            description: collection.description,
            collection_type: collection.collection_type,
          };
        }),
      );

      let res: UnifiedCollectionOutput[] = unifiedCollections;

      if (remote_data) {
        const remote_array_data: UnifiedCollectionOutput[] = await Promise.all(
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

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.collection.pulled',
          method: 'GET',
          url: '/ticketing/collection',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor
      };
    } catch (error) {
      throwTypedError(new UnifiedTicketingError({
        name: "GET_COLLECTIONS_ERROR",
        message: "CollectionService.getCollections() call failed",
        cause: error
      }))
    }
  }
}
