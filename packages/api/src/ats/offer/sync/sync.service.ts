import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IOfferService } from '../types';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedOfferOutput } from '../types/model.unified';
import { ats_offers as AtsOffer } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
    this.registry.registerService('ats', 'offer', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('ats-sync-offers', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncOffers(user_id?: string) {
    try {
      this.logger.log('Syncing offers...');
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
                const providers = ATS_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncOffersForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                    );
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

  async syncOffersForLinkedUser(
    integrationId: string,
    linkedUserId: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} offers for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ats',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping offers syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.offer',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IOfferService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalOfferOutput[]> = await service.syncOffers(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalOfferOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedCompanyOutput,
        OriginalCompanyOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'crm',
        'company',
        customFieldMappings,
      );
      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalOfferOutput[]
      >({
        sourceObject,
        targetType: AtsObject.offer,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedOfferOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const offers_data = await this.saveOffersInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.offer.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        offers_data,
        'ats.offer.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveOffersInDb(
    linkedUserId: string,
    offers: UnifiedOfferOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsOffer[]> {
    try {
      let offers_results: AtsOffer[] = [];
      for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];
        const originId = offer.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingOffer = await this.prisma.ats_offers.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_offer_id: string;

        if (existingOffer) {
          // Update the existing offer
          let data: any = {
            modified_at: new Date(),
          };
          if (offer.created_by) {
            data = { ...data, created_by: offer.created_by };
          }
          if (offer.remote_created_at) {
            data = { ...data, remote_created_at: offer.remote_created_at };
          }
          if (offer.closed_at) {
            data = { ...data, closed_at: offer.closed_at };
          }
          if (offer.sent_at) {
            data = { ...data, sent_at: offer.sent_at };
          }
          if (offer.start_date) {
            data = { ...data, start_date: offer.start_date };
          }
          if (offer.status) {
            data = { ...data, status: offer.status };
          }
          if (offer.application_id) {
            data = { ...data, application_id: offer.application_id };
          }
          const res = await this.prisma.ats_offers.update({
            where: {
              id_ats_offer: existingOffer.id_ats_offer,
            },
            data: data,
          });
          unique_ats_offer_id = res.id_ats_offer;
          offers_results = [...offers_results, res];
        } else {
          // Create a new offer
          this.logger.log('Offer does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_offer: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            id_connection: connection_id,
          };

          if (offer.created_by) {
            data = { ...data, created_by: offer.created_by };
          }
          if (offer.remote_created_at) {
            data = { ...data, remote_created_at: offer.remote_created_at };
          }
          if (offer.closed_at) {
            data = { ...data, closed_at: offer.closed_at };
          }
          if (offer.sent_at) {
            data = { ...data, sent_at: offer.sent_at };
          }
          if (offer.start_date) {
            data = { ...data, start_date: offer.start_date };
          }
          if (offer.status) {
            data = { ...data, status: offer.status };
          }
          if (offer.application_id) {
            data = { ...data, application_id: offer.application_id };
          }

          const newOffer = await this.prisma.ats_offers.create({
            data: data,
          });

          unique_ats_offer_id = newOffer.id_ats_offer;
          offers_results = [...offers_results, newOffer];
        }

        // check duplicate or existing values
        if (offer.field_mappings && offer.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_offer_id,
            },
          });

          for (const [slug, value] of Object.entries(offer.field_mappings)) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: value || 'null',
                  attribute: {
                    connect: {
                      id_attribute: attribute.id_attribute,
                    },
                  },
                  entity: {
                    connect: {
                      id_entity: entity.id_entity,
                    },
                  },
                },
              });
            }
          }
        }

        // insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ats_offer_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_offer_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return offers_results;
    } catch (error) {
      throw error;
    }
  }
}
