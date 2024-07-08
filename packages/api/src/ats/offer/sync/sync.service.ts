import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IOfferService } from '../types';
import { OriginalOfferOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedOfferOutput } from '../types/model.unified';
import { ats_offers as AtsOffer } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
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
  async kickstartSync(user_id?: string) {
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
      const service: IOfferService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedOfferOutput,
        OriginalOfferOutput,
        IOfferService
      >(integrationId, linkedUserId, 'ats', 'offer', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    offers: UnifiedOfferOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsOffer[]> {
    try {
      const offers_results: AtsOffer[] = [];

      const updateOrCreateOffer = async (
        offer: UnifiedOfferOutput,
        originId: string,
      ) => {
        const existingOffer = await this.prisma.ats_offers.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          created_by: offer.created_by ?? null,
          remote_created_at: offer.remote_created_at ?? null,
          closed_at: offer.closed_at ?? null,
          sent_at: offer.sent_at ?? null,
          start_date: offer.start_date ?? null,
          status: offer.status ?? null,
          application_id: offer.application_id ?? null,
          modified_at: new Date(),
        };

        if (existingOffer) {
          return await this.prisma.ats_offers.update({
            where: {
              id_ats_offer: existingOffer.id_ats_offer,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_offers.create({
            data: {
              ...baseData,
              id_ats_offer: uuidv4(),
              created_at: new Date(),
              id_linked_user: linkedUserId,
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];
        const originId = offer.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateOffer(offer, originId);
        const offer_id = res.id_ats_offer;
        offers_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          offer.field_mappings,
          offer_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(offer_id, remote_data[i]);
      }

      return offers_results;
    } catch (error) {
      throw error;
    }
  }
}
