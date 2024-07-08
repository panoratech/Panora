import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { AtsObject } from '@ats/@lib/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS } from '@panora/shared';
import { ats_activities as AtsActivity } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IActivityService } from '../types';
import { UnifiedActivityOutput } from '../types/model.unified';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';

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
    this.registry.registerService('ats', 'activity', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-activities',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our ats_activities table
  //its role is to fetch all activities from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log(`Syncing activities....`);
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
                    const connection = await this.prisma.connections.findFirst({
                      where: {
                        id_linked_user: linkedUser.id_linked_user,
                        provider_slug: provider.toLowerCase(),
                      },
                    });
                    //call the sync comments for every candidate of the linkedUser (an acitivty is tied to a candidate)
                    const candidates =
                      await this.prisma.ats_candidates.findMany({
                        where: {
                          id_connection: connection.id_connection,
                        },
                      });
                    for (const candidate of candidates) {
                      await this.syncForLinkedUser({
                        integrationId: provider,
                        linkedUserId: linkedUser.id_linked_user,
                        id_candidate: candidate.id_ats_candidate,
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_candidate } = data;
      const service: IActivityService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedActivityOutput,
        OriginalActivityOutput,
        IActivityService
      >(integrationId, linkedUserId, 'ats', 'activity', service, [
        {
          paramName: 'id_candidate',
          param: id_candidate,
          shouldPassToIngest: true,
          shouldPassToService: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    activities: UnifiedActivityOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_candidate?: string,
  ): Promise<AtsActivity[]> {
    try {
      const activities_results: AtsActivity[] = [];

      const updateOrCreateActivity = async (
        activity: UnifiedActivityOutput,
        originId: string,
      ) => {
        let existingActivity;
        if (!originId) {
          existingActivity = await this.prisma.ats_activities.findFirst({
            where: {
              subject: activity.subject,
              id_ats_candidate: activity.candidate_id,
              id_connection: connection_id,
            },
          });
        } else {
          existingActivity = await this.prisma.ats_activities.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          id_candidate: id_candidate ?? null,
          activity_type: activity.activity_type ?? null,
          body: activity.body ?? null,
          remote_created_at: activity.remote_created_at ?? null,
          subject: activity.subject ?? null,
          visibility: activity.visibility ?? null,
          modified_at: new Date(),
        };

        let res;
        if (existingActivity) {
          res = await this.prisma.ats_activities.update({
            where: {
              id_ats_activity: existingActivity.id_ats_activity,
            },
            data: baseData,
          });
        } else {
          res = await this.prisma.ats_activities.create({
            data: {
              ...baseData,
              id_ats_activity: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        return res;
      };

      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const originId = activity.remote_id;

        const res = await updateOrCreateActivity(activity, originId);
        const activity_id = res.id_ats_activity;
        activities_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          activity.field_mappings,
          activity_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(activity_id, remote_data[i]);
      }

      return activities_results;
    } catch (error) {
      throw error;
    }
  }
}
