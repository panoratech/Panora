import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalCollectionOutput } from '@@core/utils/types/original/original.ticketing';
import { unify } from '@@core/utils/unification/unify';
import { ICollectionService } from '../types';

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

      // WE SHOULDNT HAVE FIELD MAPPINGS TO COMMENT

      // Fetch field mappings for the collection
      /*const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: collection.id_tcg_collection,
          },
        },
        include: {
          attribute: true,
        },
      });

      Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));*/

      // Transform to UnifiedCollectionOutput format
      const unifiedCollection: UnifiedCollectionOutput = {
        id: collection.id_tcg_collection,
        body: collection.body,
        html_body: collection.html_body,
        is_private: collection.is_private,
        creator_type: collection.creator_type,
        ticket_id: collection.id_tcg_ticket,
        contact_id: collection.id_tcg_contact, // uuid of Contact object
        user_id: collection.id_tcg_user, // uuid of User object
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
      handleServiceError(error, this.logger);
    }
  }

  async getCollections(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCollectionOutput[]> {
    try {
      const collections = await this.prisma.tcg_collections.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedCollections: UnifiedCollectionOutput[] = await Promise.all(
        collections.map(async (collection) => {
          //WE SHOULDNT HAVE FIELD MAPPINGS FOR COMMENT
          // Fetch field mappings for the ticket
          /*const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: collection.id_tcg_ticket,
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
            ([key, value]) => ({ [key]: value }),
          );*/

          // Transform to UnifiedCollectionOutput format
          return {
            id: collection.id_tcg_collection,
            body: collection.body,
            html_body: collection.html_body,
            is_private: collection.is_private,
            creator_type: collection.creator_type,
            ticket_id: collection.id_tcg_ticket,
            contact_id: collection.id_tcg_contact, // uuid of Contact object
            user_id: collection.id_tcg_user, // uuid of User object
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

      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
