import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CoreUnification } from '@@core/utils/services/core.service';
import { ApiResponse } from '@@core/utils/types';
import { IJobInterviewStageService } from '../types';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedJobInterviewStageOutput } from '../types/model.unified';
import { ats_job_interview_stages as AtsJobInterviewStage } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ats-sync-job-interview-stages';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncJobInterviewStages(user_id?: string) {
    try {
      this.logger.log('Syncing job interview stages...');
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
                    await this.syncJobInterviewStagesForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                      id_project,
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

  async syncJobInterviewStagesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} job interview stages for linkedUser ${linkedUserId}`,
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
          `Skipping job interview stages syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.job_interview_stage',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IJobInterviewStageService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalJobInterviewStageOutput[]> =
        await service.syncJobInterviewStages(linkedUserId, remoteProperties);

      const sourceObject: OriginalJobInterviewStageOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalJobInterviewStageOutput[]
      >({
        sourceObject,
        targetType: AtsObject.jobinterviewstage,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings,
      })) as UnifiedJobInterviewStageOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const jobInterviewStages_data = await this.saveJobInterviewStagesInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.job_interview_stage.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        jobInterviewStages_data,
        'ats.job_interview_stage.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveJobInterviewStagesInDb(
    linkedUserId: string,
    jobInterviewStages: UnifiedJobInterviewStageOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsJobInterviewStage[]> {
    try {
      let jobInterviewStages_results: AtsJobInterviewStage[] = [];
      for (let i = 0; i < jobInterviewStages.length; i++) {
        const jobInterviewStage = jobInterviewStages[i];
        const originId = jobInterviewStage.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingJobInterviewStage =
          await this.prisma.ats_job_interview_stages.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        let unique_ats_job_interview_stage_id: string;

        if (existingJobInterviewStage) {
          // Update the existing job interview stage
          let data: any = {
            modified_at: new Date(),
          };
          if (jobInterviewStage.name) {
            data = { ...data, name: jobInterviewStage.name };
          }
          if (jobInterviewStage.stage_order) {
            data = { ...data, stage_order: jobInterviewStage.stage_order };
          }
          if (jobInterviewStage.job_id) {
            data = { ...data, job_id: jobInterviewStage.job_id };
          }
          const res = await this.prisma.ats_job_interview_stages.update({
            where: {
              id_ats_job_interview_stage:
                existingJobInterviewStage.id_ats_job_interview_stage,
            },
            data: data,
          });
          unique_ats_job_interview_stage_id = res.id_ats_job_interview_stage;
          jobInterviewStages_results = [...jobInterviewStages_results, res];
        } else {
          // Create a new job interview stage
          this.logger.log(
            'Job interview stage does not exist, creating a new one',
          );
          const uuid = uuidv4();
          let data: any = {
            id_ats_job_interview_stage: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (jobInterviewStage.name) {
            data = { ...data, name: jobInterviewStage.name };
          }
          if (jobInterviewStage.stage_order) {
            data = { ...data, stage_order: jobInterviewStage.stage_order };
          }
          if (jobInterviewStage.job_id) {
            data = { ...data, job_id: jobInterviewStage.job_id };
          }

          const newJobInterviewStage =
            await this.prisma.ats_job_interview_stages.create({
              data: data,
            });

          unique_ats_job_interview_stage_id =
            newJobInterviewStage.id_ats_job_interview_stage;
          jobInterviewStages_results = [
            ...jobInterviewStages_results,
            newJobInterviewStage,
          ];
        }

        // check duplicate or existing values
        if (
          jobInterviewStage.field_mappings &&
          jobInterviewStage.field_mappings.length > 0
        ) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_job_interview_stage_id,
            },
          });

          for (const [slug, value] of Object.entries(
            jobInterviewStage.field_mappings,
          )) {
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
            ressource_owner_id: unique_ats_job_interview_stage_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_job_interview_stage_id,
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
      return jobInterviewStages_results;
    } catch (error) {
      throw error;
    }
  }
}
