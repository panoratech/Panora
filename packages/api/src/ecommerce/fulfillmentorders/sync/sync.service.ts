import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalFulfillmentOrdersOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS, ECOMMERCE_PROVIDERS } from '@panora/shared';
import { ecommerce_fulfillmentorders as EcommerceFulfillmentOrders } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFulfillmentOrdersService } from '../types';
import { UnifiedFulfillmentOrdersOutput } from '../types/model.unified';

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
    this.registry.registerService('ecommerce', 'fulfillmentorders', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ecommerce-sync-fulfillmentorderss',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing fulfillmentorderss...');
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
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
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IFulfillmentOrdersService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFulfillmentOrdersOutput,
        OriginalFulfillmentOrdersOutput,
        IFulfillmentOrdersService
      >(
        integrationId,
        linkedUserId,
        'ecommerce',
        'fulfillmentorders',
        service,
        [],
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    fulfillmentorderss: UnifiedFulfillmentOrdersOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<EcommerceFulfillmentOrders[]> {
    try {
      const fulfillmentorderss_results: EcommerceFulfillmentOrders[] = [];

      const updateOrCreateFulfillmentOrders = async (
        fulfillmentorders: UnifiedFulfillmentOrdersOutput,
        originId: string,
      ) => {
        let existingFulfillmentOrders;
        if (!originId) {
          existingFulfillmentOrders =
            await this.prisma.ecommerce_fulfillmentorderss.findFirst({
              where: {
                name: fulfillmentorders.name,
                id_connection: connection_id,
              },
            });
        } else {
          existingFulfillmentOrders =
            await this.prisma.ecommerce_fulfillmentorderss.findFirst({
              where: {
                remote_id: originId,
                id_connection: connection_id,
              },
            });
        }

        const baseData: any = {
          name: fulfillmentorders.name ?? null,
          modified_at: new Date(),
        };

        if (existingFulfillmentOrders) {
          return await this.prisma.ecommerce_fulfillmentorderss.update({
            where: {
              id_ecommerce_fulfillmentorders:
                existingFulfillmentOrders.id_ecommerce_fulfillmentorders,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ecommerce_fulfillmentorderss.create({
            data: {
              ...baseData,
              id_ecommerce_fulfillmentorders: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < fulfillmentorderss.length; i++) {
        const fulfillmentorders = fulfillmentorderss[i];
        const originId = fulfillmentorders.remote_id;

        const res = await updateOrCreateFulfillmentOrders(
          fulfillmentorders,
          originId,
        );
        const fulfillmentorders_id = res.id_ecommerce_fulfillmentorders;
        fulfillmentorderss_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          fulfillmentorders.field_mappings,
          fulfillmentorders_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          fulfillmentorders_id,
          remote_data[i],
        );
      }

      return fulfillmentorderss_results;
    } catch (error) {
      throw error;
    }
  }
}
