import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedTaskInput, UnifiedTaskOutput } from '../types/model.unified';
import { CrmObject } from '@crm/@lib/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { ITaskService } from '../types';
import { throwTypedError, UnifiedCrmError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(TaskService.name);
  }

  async batchAddTasks(
    unifiedTaskData: UnifiedTaskInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaskOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedTaskData.map((unifiedData) =>
          this.addTask(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throw error;
    }
  }

  async addTask(
    unifiedTaskData: UnifiedTaskInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaskOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      //CHECKS
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');

      const company = unifiedTaskData.company_id;
      //check if contact_id and account_id refer to real uuids
      if (company) {
        const search = await this.prisma.crm_companies.findUnique({
          where: {
            id_crm_company: company,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a company_id which does not exist',
          );
      }
      const user = unifiedTaskData.user_id;
      //check if contact_id and account_id refer to real uuids
      if (user) {
        const search = await this.prisma.crm_users.findUnique({
          where: {
            id_crm_user: user,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a user_id which does not exist',
          );
      }

      const deal = unifiedTaskData.deal_id;
      //check if contact_id and account_id refer to real uuids
      if (deal) {
        const search = await this.prisma.crm_deals.findUnique({
          where: {
            id_crm_deal: deal,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a deal_id which does not exist',
          );
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedTaskInput>({
          sourceObject: unifiedTaskData,
          targetType: CrmObject.task,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      const service: ITaskService =
        this.serviceRegistry.getService(integrationId);

      const resp: ApiResponse<OriginalTaskOutput> = await service.addTask(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalTaskOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.task,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings: [],
      })) as UnifiedTaskOutput[];

      // add the task inside our db
      const source_task = resp.data;
      const target_task = unifiedObject[0];

      const existingTask = await this.prisma.crm_tasks.findFirst({
        where: {
          remote_id: target_task.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_crm_task_id: string;

      if (existingTask) {
        // Update the existing task
        let data: any = {
          modified_at: new Date(),
        };
        if (target_task.subject) {
          data = { ...data, subject: target_task.subject };
        }
        if (target_task.content) {
          data = { ...data, content: target_task.content };
        }
        if (target_task.status) {
          data = { ...data, status: target_task.status };
        }
        if (target_task.due_date) {
          data = { ...data, due_date: target_task.due_date };
        }
        if (target_task.finished_date) {
          data = { ...data, finished_date: target_task.finished_date };
        }
        if (target_task.deal_id) {
          data = { ...data, id_crm_deal: target_task.deal_id };
        }
        if (target_task.user_id) {
          data = { ...data, id_crm_user: target_task.user_id };
        }
        if (target_task.company_id) {
          data = { ...data, id_crm_company: target_task.company_id };
        }

        const res = await this.prisma.crm_tasks.update({
          where: {
            id_crm_task: existingTask.id_crm_task,
          },
          data: data,
        });
        unique_crm_task_id = res.id_crm_task;
      } else {
        // Create a new task
        this.logger.log('task not exists');
        let data: any = {
          id_crm_task: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_task.remote_id,
          remote_platform: integrationId,
        };

        if (target_task.subject) {
          data = { ...data, subject: target_task.subject };
        }
        if (target_task.content) {
          data = { ...data, content: target_task.content };
        }
        if (target_task.status) {
          data = { ...data, status: target_task.status };
        }
        if (target_task.due_date) {
          data = { ...data, due_date: target_task.due_date };
        }
        if (target_task.finished_date) {
          data = { ...data, finished_date: target_task.finished_date };
        }
        if (target_task.deal_id) {
          data = { ...data, id_crm_deal: target_task.deal_id };
        }
        if (target_task.user_id) {
          data = { ...data, id_crm_user: target_task.user_id };
        }
        if (target_task.company_id) {
          data = { ...data, id_crm_company: target_task.company_id };
        }
        const res = await this.prisma.crm_tasks.create({
          data: data,
        });
        unique_crm_task_id = res.id_crm_task;
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
          data: JSON.stringify(source_task),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_task),
          created_at: new Date(),
        },
      });

      const result_task = await this.getTask(unique_crm_task_id, remote_data);

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.task.push', //sync, push or pull
          method: 'POST',
          url: '/crm/tasks',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_task,
        'crm.task.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_task;
    } catch (error) {
      throw error;
    }
  }

  async getTask(
    id_task: string,
    remote_data?: boolean,
  ): Promise<UnifiedTaskOutput> {
    try {
      const task = await this.prisma.crm_tasks.findUnique({
        where: {
          id_crm_task: id_task,
        },
      });

      // Fetch field mappings for the task
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: task.id_crm_task,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedTaskOutput format
      const unifiedTask: UnifiedTaskOutput = {
        id: task.id_crm_task,
        subject: task.subject,
        content: task.content,
        status: task.status,
        due_date: task.due_date,
        finished_date: task.finished_date,
        company_id: task.id_crm_company,
        deal_id: task.id_crm_deal, // uuid of Contact object
        user_id: task.id_crm_user, // uuid of User object
      };

      let res: UnifiedTaskOutput = {
        ...unifiedTask,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: task.id_crm_task,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getTasks(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTaskOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_tasks.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_crm_task: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const tasks = await this.prisma.crm_tasks.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_task: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (tasks.length === limit + 1) {
        next_cursor = Buffer.from(tasks[tasks.length - 1].id_crm_task).toString(
          'base64',
        );
        tasks.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedTasks: UnifiedTaskOutput[] = await Promise.all(
        tasks.map(async (task) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: task.id_crm_task,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedTaskOutput format
          return {
            id: task.id_crm_task,
            subject: task.subject,
            content: task.content,
            status: task.status,
            due_date: task.due_date,
            finished_date: task.finished_date,
            company_id: task.id_crm_company,
            deal_id: task.id_crm_deal, // uuid of Contact object
            user_id: task.id_crm_user, // uuid of User object
          };
        }),
      );

      let res: UnifiedTaskOutput[] = unifiedTasks;

      if (remote_data) {
        const remote_array_data: UnifiedTaskOutput[] = await Promise.all(
          res.map(async (task) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: task.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...task, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.task.pulled',
          method: 'GET',
          url: '/crm/tasks',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateTask(
    id_task: string,
    data: Partial<UnifiedTaskInput>,
  ): Promise<UnifiedTaskOutput> {
    return;
  }
}
