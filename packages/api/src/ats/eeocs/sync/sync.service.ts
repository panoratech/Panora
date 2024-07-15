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
import { IEeocsService } from '../types';
import { OriginalEeocsOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedEeocsOutput } from '../types/model.unified';
import { ats_eeocs as AtsEeocs } from '@prisma/client';
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
    this.registry.registerService('ats', 'eeocs', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('ats-sync-eeocs', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing EEOCs...');
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
      const service: IEeocsService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedEeocsOutput,
        OriginalEeocsOutput,
        IEeocsService
      >(integrationId, linkedUserId, 'ats', 'eeocs', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    eeocs: UnifiedEeocsOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsEeocs[]> {
    try {
      const eeocs_results: AtsEeocs[] = [];

      const updateOrCreateEeoc = async (
        eeoc: UnifiedEeocsOutput,
        originId: string,
      ) => {
        const existingEeoc = await this.prisma.ats_eeocs.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          candidate_id: eeoc.candidate_id ?? null,
          submitted_at: eeoc.submitted_at ?? null,
          race: eeoc.race ?? null,
          gender: eeoc.gender ?? null,
          veteran_status: eeoc.veteran_status ?? null,
          disability_status: eeoc.disability_status ?? null,
          modified_at: new Date(),
        };

        if (existingEeoc) {
          return await this.prisma.ats_eeocs.update({
            where: {
              id_ats_eeoc: existingEeoc.id_ats_eeoc,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_eeocs.create({
            data: {
              ...baseData,
              id_ats_eeoc: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < eeocs.length; i++) {
        const eeoc = eeocs[i];
        const originId = eeoc.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateEeoc(eeoc, originId);
        const eeoc_id = res.id_ats_eeoc;
        eeocs_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          eeoc.field_mappings,
          eeoc_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(eeoc_id, remote_data[i]);
      }

      return eeocs_results;
    } catch (error) {
      throw error;
    }
  }
}
