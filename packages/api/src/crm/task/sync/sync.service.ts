import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTaskOutput } from '../types/model.unified';
import { ITaskService } from '../types';
import { crm_tasks as CrmTask } from '@prisma/client';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

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
    const jobName = 'crm-sync-tasks';

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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTasksForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
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
      const resp: ApiResponse<OriginalTaskOutput[]> = await service.syncTasks(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalTaskOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalTaskOutput[]
      >({
        sourceObject,
        targetType: CrmObject.task,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings,
      })) as UnifiedTaskOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const tasks_data = await this.saveTasksInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.task.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        tasks_data,
        'crm.task.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveTasksInDb(
    linkedUserId: string,
    tasks: UnifiedTaskOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmTask[]> {
    try {
      let tasks_results: CrmTask[] = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const originId = task.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingTask = await this.prisma.crm_tasks.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
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
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
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
