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
import { IJobService } from '../types';
import { OriginalJobOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedJobOutput } from '../types/model.unified';
import { ats_jobs as AtsJob } from '@prisma/client';
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
    this.registry.registerService('ats', 'job', this);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ats-sync-jobs';

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
  async syncJobs(user_id?: string) {
    try {
      this.logger.log('Syncing jobs...');
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
                    await this.syncJobsForLinkedUser(
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

  async syncJobsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} jobs for linkedUser ${linkedUserId}`,
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
          `Skipping jobs syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.job',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IJobService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalJobOutput[]> = await service.syncJobs(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalJobOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalJobOutput[]
      >({
        sourceObject,
        targetType: AtsObject.job,
        providerName: integrationId,
        vertical: 'ats',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedJobOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const jobs_data = await this.saveJobsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.job.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        jobs_data,
        'ats.job.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveJobsInDb(
    linkedUserId: string,
    jobs: UnifiedJobOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsJob[]> {
    try {
      let jobs_results: AtsJob[] = [];
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const originId = job.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingJob = await this.prisma.ats_jobs.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_job_id: string;

        if (existingJob) {
          // Update the existing job
          let data: any = {
            modified_at: new Date(),
          };
          if (job.name) {
            data = { ...data, name: job.name };
          }
          if (job.description) {
            data = { ...data, description: job.description };
          }
          if (job.code) {
            data = { ...data, code: job.code };
          }
          if (job.status) {
            data = { ...data, status: job.status };
          }
          if (job.type) {
            data = { ...data, type: job.type };
          }
          if (job.confidential !== undefined) {
            data = { ...data, confidential: job.confidential };
          }
          if (job.departments) {
            data = { ...data, departments: job.departments };
          }
          if (job.offices) {
            data = { ...data, offices: job.offices };
          }
          if (job.managers) {
            data = { ...data, managers: job.managers };
          }
          if (job.recruiters) {
            data = { ...data, recruiters: job.recruiters };
          }
          if (job.remote_created_at) {
            data = { ...data, remote_created_at: job.remote_created_at };
          }
          if (job.remote_updated_at) {
            data = { ...data, remote_updated_at: job.remote_updated_at };
          }
          const res = await this.prisma.ats_jobs.update({
            where: {
              id_ats_job: existingJob.id_ats_job,
            },
            data: data,
          });
          unique_ats_job_id = res.id_ats_job;
          jobs_results = [...jobs_results, res];
        } else {
          // Create a new job
          this.logger.log('Job does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_job: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (job.name) {
            data = { ...data, name: job.name };
          }
          if (job.description) {
            data = { ...data, description: job.description };
          }
          if (job.code) {
            data = { ...data, code: job.code };
          }
          if (job.status) {
            data = { ...data, status: job.status };
          }
          if (job.type) {
            data = { ...data, type: job.type };
          }
          if (job.confidential !== undefined) {
            data = { ...data, confidential: job.confidential };
          }
          if (job.departments) {
            data = { ...data, departments: job.departments };
          }
          if (job.offices) {
            data = { ...data, offices: job.offices };
          }
          if (job.managers) {
            data = { ...data, managers: job.managers };
          }
          if (job.recruiters) {
            data = { ...data, recruiters: job.recruiters };
          }
          if (job.remote_created_at) {
            data = { ...data, remote_created_at: job.remote_created_at };
          }
          if (job.remote_updated_at) {
            data = { ...data, remote_updated_at: job.remote_updated_at };
          }

          const newJob = await this.prisma.ats_jobs.create({
            data: data,
          });

          unique_ats_job_id = newJob.id_ats_job;
          jobs_results = [...jobs_results, newJob];
        }

        // check duplicate or existing values
        if (job.field_mappings && job.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_job_id,
            },
          });

          for (const [slug, value] of Object.entries(job.field_mappings)) {
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
            ressource_owner_id: unique_ats_job_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_job_id,
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
      return jobs_results;
    } catch (error) {
      throw error;
    }
  }
}
