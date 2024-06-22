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
import { IApplicationService } from '../types';
import { OriginalApplicationOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedApplicationOutput } from '../types/model.unified';
import { ats_applications as AtsApplication } from '@prisma/client';
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
    const jobName = 'ats-sync-applications';

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
  async syncApplications(user_id?: string) {
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
                    await this.syncApplicationsForLinkedUser(
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

  async syncApplicationsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} applications for linkedUser ${linkedUserId}`,
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
          `Skipping applications syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.application',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IApplicationService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalApplicationOutput[]> =
        await service.syncApplications(linkedUserId, remoteProperties);

      const sourceObject: OriginalApplicationOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalApplicationOutput[]
      >({
        sourceObject,
        targetType: AtsObject.application,
        providerName: integrationId,
        vertical: 'ats',
        customFieldMappings,
      })) as UnifiedApplicationOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const applications_data = await this.saveApplicationsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.application.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        applications_data,
        'ats.application.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveApplicationsInDb(
    linkedUserId: string,
    applications: UnifiedApplicationOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsApplication[]> {
    try {
      let applications_results: AtsApplication[] = [];
      for (let i = 0; i < applications.length; i++) {
        const application = applications[i];
        const originId = application.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingApplication =
          await this.prisma.ats_applications.findFirst({
            where: {
              remote_id: originId,
              remote_platform: originSource,
              id_linked_user: linkedUserId,
            },
          });

        let unique_ats_application_id: string;

        if (existingApplication) {
          // Update the existing application
          let data: any = {
            modified_at: new Date(),
          };
          if (application.applied_at) {
            data = { ...data, applied_at: application.applied_at };
          }
          if (application.rejected_at) {
            data = { ...data, rejected_at: application.rejected_at };
          }
          if (application.offers) {
            data = { ...data, offers: application.offers };
          }
          if (application.source) {
            data = { ...data, source: application.source };
          }
          if (application.credited_to) {
            data = { ...data, credited_to: application.credited_to };
          }
          if (application.current_stage) {
            data = { ...data, current_stage: application.current_stage };
          }
          if (application.reject_reason) {
            data = { ...data, reject_reason: application.reject_reason };
          }
          if (application.candidate_id) {
            data = { ...data, candidate_id: application.candidate_id };
          }
          if (application.job_id) {
            data = { ...data, job_id: application.job_id };
          }
          const res = await this.prisma.ats_applications.update({
            where: {
              id_ats_application: existingApplication.id_ats_application,
            },
            data: data,
          });
          unique_ats_application_id = res.id_ats_application;
          applications_results = [...applications_results, res];
        } else {
          // Create a new application
          this.logger.log('Application does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_application: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (application.applied_at) {
            data = { ...data, applied_at: application.applied_at };
          }
          if (application.rejected_at) {
            data = { ...data, rejected_at: application.rejected_at };
          }
          if (application.offers) {
            data = { ...data, offers: application.offers };
          }
          if (application.source) {
            data = { ...data, source: application.source };
          }
          if (application.credited_to) {
            data = { ...data, credited_to: application.credited_to };
          }
          if (application.current_stage) {
            data = { ...data, current_stage: application.current_stage };
          }
          if (application.reject_reason) {
            data = { ...data, reject_reason: application.reject_reason };
          }
          if (application.candidate_id) {
            data = { ...data, candidate_id: application.candidate_id };
          }
          if (application.job_id) {
            data = { ...data, job_id: application.job_id };
          }

          const newApplication = await this.prisma.ats_applications.create({
            data: data,
          });

          unique_ats_application_id = newApplication.id_ats_application;
          applications_results = [...applications_results, newApplication];
        }

        // check duplicate or existing values
        if (
          application.field_mappings &&
          application.field_mappings.length > 0
        ) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_application_id,
            },
          });

          for (const [slug, value] of Object.entries(
            application.field_mappings,
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
            ressource_owner_id: unique_ats_application_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_application_id,
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
      return applications_results;
    } catch (error) {
      throw error;
    }
  }
}
