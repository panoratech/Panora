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
import { CoreSyncRegistry } from '@@core/sync/registry.service';
import { ApiResponse } from '@@core/utils/types';
import { IInterviewService } from '../types';
import { OriginalInterviewOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedInterviewOutput } from '../types/model.unified';
import { ats_interviews as AtsInterview } from '@prisma/client';
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
    private registry: CoreSyncRegistry,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ats', 'interview', this);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ats-sync-interviews';

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
  async syncInterviews(user_id?: string) {
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
                    await this.syncInterviewsForLinkedUser(
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

  async syncInterviewsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} interviews for linkedUser ${linkedUserId}`,
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
          `Skipping interviews syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.interview',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IInterviewService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalInterviewOutput[]> =
        await service.syncInterviews(linkedUserId, remoteProperties);

      const sourceObject: OriginalInterviewOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalInterviewOutput[]
      >({
        sourceObject,
        targetType: AtsObject.interview,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedInterviewOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const interviews_data = await this.saveInterviewsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.interview.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        interviews_data,
        'ats.interview.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveInterviewsInDb(
    linkedUserId: string,
    interviews: UnifiedInterviewOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsInterview[]> {
    try {
      let interviews_results: AtsInterview[] = [];
      for (let i = 0; i < interviews.length; i++) {
        const interview = interviews[i];
        const originId = interview.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingInterview = await this.prisma.ats_interviews.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_interview_id: string;

        if (existingInterview) {
          // Update the existing interview
          let data: any = {
            modified_at: new Date(),
          };
          if (interview.status) {
            data = { ...data, status: interview.status };
          }
          if (interview.application_id) {
            data = { ...data, application_id: interview.application_id };
          }
          if (interview.job_interview_stage_id) {
            data = {
              ...data,
              job_interview_stage_id: interview.job_interview_stage_id,
            };
          }
          if (interview.organized_by) {
            data = { ...data, organized_by: interview.organized_by };
          }
          if (interview.interviewers) {
            data = { ...data, interviewers: interview.interviewers };
          }
          if (interview.location) {
            data = { ...data, location: interview.location };
          }
          if (interview.start_at) {
            data = { ...data, start_at: interview.start_at };
          }
          if (interview.end_at) {
            data = { ...data, end_at: interview.end_at };
          }
          if (interview.remote_created_at) {
            data = { ...data, remote_created_at: interview.remote_created_at };
          }
          if (interview.remote_updated_at) {
            data = { ...data, remote_updated_at: interview.remote_updated_at };
          }
          const res = await this.prisma.ats_interviews.update({
            where: {
              id_ats_interview: existingInterview.id_ats_interview,
            },
            data: data,
          });
          unique_ats_interview_id = res.id_ats_interview;
          interviews_results = [...interviews_results, res];
        } else {
          // Create a new interview
          this.logger.log('Interview does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_interview: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (interview.status) {
            data = { ...data, status: interview.status };
          }
          if (interview.application_id) {
            data = { ...data, application_id: interview.application_id };
          }
          if (interview.job_interview_stage_id) {
            data = {
              ...data,
              job_interview_stage_id: interview.job_interview_stage_id,
            };
          }
          if (interview.organized_by) {
            data = { ...data, organized_by: interview.organized_by };
          }
          if (interview.interviewers) {
            data = { ...data, interviewers: interview.interviewers };
          }
          if (interview.location) {
            data = { ...data, location: interview.location };
          }
          if (interview.start_at) {
            data = { ...data, start_at: interview.start_at };
          }
          if (interview.end_at) {
            data = { ...data, end_at: interview.end_at };
          }
          if (interview.remote_created_at) {
            data = { ...data, remote_created_at: interview.remote_created_at };
          }
          if (interview.remote_updated_at) {
            data = { ...data, remote_updated_at: interview.remote_updated_at };
          }

          const newInterview = await this.prisma.ats_interviews.create({
            data: data,
          });

          unique_ats_interview_id = newInterview.id_ats_interview;
          interviews_results = [...interviews_results, newInterview];
        }

        // check duplicate or existing values
        if (interview.field_mappings && interview.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_interview_id,
            },
          });

          for (const [slug, value] of Object.entries(
            interview.field_mappings,
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
            ressource_owner_id: unique_ats_interview_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_interview_id,
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
      return interviews_results;
    } catch (error) {
      throw error;
    }
  }
}
