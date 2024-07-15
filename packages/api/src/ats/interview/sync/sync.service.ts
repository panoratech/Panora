import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalInterviewOutput } from '@@core/utils/types/original/original.ats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS } from '@panora/shared';
import { ats_interviews as AtsInterview } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IInterviewService } from '../types';
import { UnifiedInterviewOutput } from '../types/model.unified';

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
    this.registry.registerService('ats', 'interview', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-interviews',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing interviews...');
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
      const service: IInterviewService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedInterviewOutput,
        OriginalInterviewOutput,
        IInterviewService
      >(integrationId, linkedUserId, 'ats', 'interview', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    interviews: UnifiedInterviewOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsInterview[]> {
    try {
      const interviews_results: AtsInterview[] = [];

      const updateOrCreateInterview = async (
        interview: UnifiedInterviewOutput,
        originId: string,
      ) => {
        const existingInterview = await this.prisma.ats_interviews.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          status: interview.status ?? null,
          application_id: interview.application_id ?? null,
          job_interview_stage_id: interview.job_interview_stage_id ?? null,
          organized_by: interview.organized_by ?? null,
          interviewers: interview.interviewers ?? null,
          location: interview.location ?? null,
          start_at: interview.start_at ?? null,
          end_at: interview.end_at ?? null,
          remote_created_at: interview.remote_created_at ?? null,
          remote_updated_at: interview.remote_updated_at ?? null,
          modified_at: new Date(),
        };

        if (existingInterview) {
          return await this.prisma.ats_interviews.update({
            where: {
              id_ats_interview: existingInterview.id_ats_interview,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_interviews.create({
            data: {
              ...baseData,
              id_ats_interview: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < interviews.length; i++) {
        const interview = interviews[i];
        const originId = interview.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateInterview(interview, originId);
        const interview_id = res.id_ats_interview;
        interviews_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          interview.field_mappings,
          interview_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          interview_id,
          remote_data[i],
        );
      }

      return interviews_results;
    } catch (error) {
      throw error;
    }
  }
}
