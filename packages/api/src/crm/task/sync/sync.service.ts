import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedTaskOutput } from '../types/model.unified';
import { ITaskService } from '../types';
import { crm_tasks as CrmTask } from '@prisma/client';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
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
    this.registry.registerService('crm', 'task', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('crm-sync-tasks', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our crm_tasks table
  //its role is to fetch all tasks from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncTasks(user_id?: string) {
    try {
      this.logger.log(`Syncing tasks....`);
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
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
                for (const provider of providers) {
                  try {
                    await this.syncTasksForLinkedUser(
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTasksForLinkedUser(integrationId: string, linkedUserId: string) {
    try {
      this.logger.log(
        `Syncing ${integrationId} tasks for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'crm',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping tasks syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.task',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ITaskService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalTaskOutput[]> = await service.syncTasks(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalTaskOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedTaskOutput,
        OriginalTaskOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'crm',
        'task',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedTaskOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmTask[]> {
    try {
      let tasks_results: CrmTask[] = [];
      for (let i = 0; i < data.length; i++) {
        const task = data[i];
        const originId = task.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingTask = await this.prisma.crm_tasks.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_crm_task_id: string;

        if (existingTask) {
          // Update the existing task
          let data: any = {
            modified_at: new Date(),
          };
          if (task.subject) {
            data = { ...data, subject: task.subject };
          }
          if (task.content) {
            data = { ...data, content: task.content };
          }
          if (task.status) {
            data = { ...data, status: task.status };
          }
          if (task.due_date) {
            data = { ...data, due_date: task.due_date };
          }
          if (task.finished_date) {
            data = { ...data, finished_date: task.finished_date };
          }
          if (task.deal_id) {
            data = { ...data, id_crm_deal: task.deal_id };
          }
          if (task.user_id) {
            data = { ...data, id_crm_user: task.user_id };
          }
          if (task.company_id) {
            data = { ...data, id_crm_company: task.company_id };
          }

          const res = await this.prisma.crm_tasks.update({
            where: {
              id_crm_task: existingTask.id_crm_task,
            },
            data: data,
          });
          unique_crm_task_id = res.id_crm_task;
          tasks_results = [...tasks_results, res];
        } else {
          // Create a new task
          this.logger.log('task not exists');
          let data: any = {
            id_crm_task: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (task.subject) {
            data = { ...data, subject: task.subject };
          }
          if (task.content) {
            data = { ...data, content: task.content };
          }
          if (task.status) {
            data = { ...data, status: task.status };
          }
          if (task.due_date) {
            data = { ...data, due_date: task.due_date };
          }
          if (task.finished_date) {
            data = { ...data, finished_date: task.finished_date };
          }
          if (task.deal_id) {
            data = { ...data, id_crm_deal: task.deal_id };
          }
          if (task.user_id) {
            data = { ...data, id_crm_user: task.user_id };
          }
          if (task.company_id) {
            data = { ...data, id_crm_company: task.company_id };
          }
          const res = await this.prisma.crm_tasks.create({
            data: data,
          });
          unique_crm_task_id = res.id_crm_task;
          tasks_results = [...tasks_results, res];
        }
        // check duplicate or existing values
        if (task.field_mappings && task.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_task_id,
            },
          });

          for (const [slug, value] of Object.entries(task.field_mappings)) {
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

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_crm_task_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_task_id,
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
      return tasks_results;
    } catch (error) {
      throw error;
    }
  }
}
