import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalCollectionOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_collections as TicketingCollection } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ICollectionService } from '../types';
import { UnifiedTicketingCollectionOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'collection', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_collections table
  //its role is to fetch all collections from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
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
          const providers = TICKETING_PROVIDERS;
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ICollectionService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: collection} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingCollectionOutput,
        OriginalCollectionOutput,
        ICollectionService
      >(integrationId, linkedUserId, 'ticketing', 'collection', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedTicketingCollectionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_ticket?: string,
  ): Promise<TicketingCollection[]> {
    try {
      const collections_results: TicketingCollection[] = [];

      const updateOrCreateCollection = async (
        collection: UnifiedTicketingCollectionOutput,
        originId: string,
        connection_id: string,
        id_ticket?: string,
      ) => {
        const existingCollection = await this.prisma.tcg_collections.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: collection.name ?? null,
          description: collection.description ?? null,
          collection_type: collection.collection_type ?? null,
          modified_at: new Date(),
          //todo id_tcg_ticket: id_ticket ?? null,
        };

        if (existingCollection) {
          return await this.prisma.tcg_collections.update({
            where: {
              id_tcg_collection: existingCollection.id_tcg_collection,
            },
            data: {
              ...baseData,
            },
          });
        } else {
          return await this.prisma.tcg_collections.create({
            data: {
              ...baseData,
              id_tcg_collection: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
              id_linked_user: linkedUserId,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const collection = data[i];
        const originId = collection.remote_id;

        const res = await updateOrCreateCollection(
          collection,
          originId,
          connection_id,
          id_ticket,
        );
        const collection_id = res.id_tcg_collection;
        collections_results.push(res);

        await this.ingestService.processRemoteData(
          collection_id,
          remote_data[i],
        );
      }
      return collections_results;
    } catch (error) {
      throw error;
    }
  }
}
