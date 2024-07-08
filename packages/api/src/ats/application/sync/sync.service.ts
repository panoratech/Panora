import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS } from '@panora/shared';
import { ats_applications as AtsApplication } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IApplicationService } from '../types';
import { UnifiedApplicationOutput } from '../types/model.unified';

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
    this.registry.registerService('ats', 'application', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-applications',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing applications...');
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
      const service: IApplicationService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedApplicationOutput,
        OriginalApplicationOutput,
        IApplicationService
      >(integrationId, linkedUserId, 'ats', 'application', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    applications: UnifiedApplicationOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsApplication[]> {
    try {
      const applications_results: AtsApplication[] = [];

      const updateOrCreateApplication = async (
        application: UnifiedApplicationOutput,
        originId: string,
      ) => {
        const existingApplication =
          await this.prisma.ats_applications.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const baseData: any = {
          applied_at: application.applied_at ?? null,
          rejected_at: application.rejected_at ?? null,
          offers: application.offers ?? null,
          source: application.source ?? null,
          credited_to: application.credited_to ?? null,
          current_stage: application.current_stage ?? null,
          reject_reason: application.reject_reason ?? null,
          candidate_id: application.candidate_id ?? null,
          job_id: application.job_id ?? null,
          modified_at: new Date(),
        };

        let res;
        if (existingApplication) {
          res = await this.prisma.ats_applications.update({
            where: {
              id_ats_application: existingApplication.id_ats_application,
            },
            data: baseData,
          });
        } else {
          res = await this.prisma.ats_applications.create({
            data: {
              ...baseData,
              id_ats_application: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        return res;
      };

      for (let i = 0; i < applications.length; i++) {
        const application = applications[i];
        const originId = application.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateApplication(application, originId);
        const application_id = res.id_ats_application;
        applications_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          application.field_mappings,
          application_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          application_id,
          remote_data[i],
        );
      }

      return applications_results;
    } catch (error) {
      throw error;
    }
  }
}
