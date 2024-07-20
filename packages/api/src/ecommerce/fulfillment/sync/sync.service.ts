import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalFulfillmentOutput } from '@@core/utils/types/original/original.ecommerce';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ECOMMERCE_PROVIDERS } from '@panora/shared';
import { ecom_fulfilments as EcommerceFulfillment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFulfillmentService } from '../types';
import { UnifiedFulfilmentOutput } from '../types/model.unified';

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
    this.registry.registerService('ecommerce', 'fulfillment', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ecommerce-sync-fulfillments',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing fulfillments...');
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
                    const connection = await this.prisma.connections.findFirst({
                      where: {
                        id_linked_user: linkedUser.id_linked_user,
                        provider_slug: provider.toLowerCase(),
                      },
                    });
                    //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                    const orders = await this.prisma.ecom_orders.findMany({
                      where: {
                        id_connection: connection.id_connection,
                      },
                    });
                    for (const order of orders) {
                      await this.syncForLinkedUser({
                        integrationId: provider,
                        linkedUserId: linkedUser.id_linked_user,
                        id_order: order.id_ecom_order,
                      });
                    }
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
      const { integrationId, linkedUserId, id_order } = param;
      const service: IFulfillmentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFulfilmentOutput,
        OriginalFulfillmentOutput,
        IFulfillmentService
      >(integrationId, linkedUserId, 'ecommerce', 'fulfillment', service, [
        {
          param: id_order,
          paramName: 'id_order',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    fulfillments: UnifiedFulfilmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    order_id?: string,
  ): Promise<EcommerceFulfillment[]> {
    try {
      const fulfillments_results: EcommerceFulfillment[] = [];

      const updateOrCreateFulfillment = async (
        fulfillment: UnifiedFulfilmentOutput,
        originId: string,
      ) => {
        let existingFulfillment;
        if (!originId) {
          existingFulfillment = await this.prisma.ecom_fulfilments.findFirst({
            where: {
              id_connection: connection_id,
              tracking_numbers: {
                hasSome: fulfillment.tracking_numbers,
              },
            },
          });
        } else {
          existingFulfillment = await this.prisma.ecom_fulfilments.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          carrier: fulfillment.carrier ?? null,
          tracking_urls: fulfillment.tracking_urls ?? [],
          tracking_numbers: fulfillment.tracking_numbers ?? [],
          items: fulfillment.items ?? null,
          id_ecom_order: order_id ?? null,
          modified_at: new Date(),
        };

        if (existingFulfillment) {
          return await this.prisma.ecom_fulfilments.update({
            where: {
              id_ecom_fulfilment: existingFulfillment.id_ecom_fulfilment,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ecom_fulfilments.create({
            data: {
              ...baseData,
              id_ecom_fulfilment: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < fulfillments.length; i++) {
        const fulfillment = fulfillments[i];
        const originId = fulfillment.remote_id;

        const res = await updateOrCreateFulfillment(fulfillment, originId);
        const fulfillment_id = res.id_ecom_fulfilment;
        fulfillments_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          fulfillment.field_mappings,
          fulfillment_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          fulfillment_id,
          remote_data[i],
        );
      }

      return fulfillments_results;
    } catch (error) {
      throw error;
    }
  }
}
