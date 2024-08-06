import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject } from '@crm/@lib/@types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ITaskService } from '../types';
import {
  TaskStatus,
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(TaskService.name);
  }

  async addTask(
    unifiedTaskData: UnifiedCrmTaskInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmTaskOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);
      await this.validateCompanyId(unifiedTaskData.company_id);
      await this.validateUserId(unifiedTaskData.user_id);
      await this.validateDealId(unifiedTaskData.deal_id);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.task',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmTaskInput>({
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

      const unifiedObject = (await this.coreUnification.unify<
        OriginalTaskOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.task,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedCrmTaskOutput[];

      const source_task = resp.data;
      const target_task = unifiedObject[0];

      const unique_crm_task_id = await this.saveOrUpdateTask(
        target_task,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_crm_task_id,
        source_task,
      );

      const result_task = await this.getTask(
        unique_crm_task_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.task.push', // sync, push or pull
          method: 'POST',
          url: '/crm/tasks',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
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

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async validateCompanyId(companyId?: string) {
    if (companyId) {
      const company = await this.prisma.crm_companies.findUnique({
        where: { id_crm_company: companyId },
      });
      if (!company)
        throw new ReferenceError(
          'You inserted a company_id which does not exist',
        );
    }
  }

  async validateUserId(userId?: string) {
    if (userId) {
      const user = await this.prisma.crm_users.findUnique({
        where: { id_crm_user: userId },
      });
      if (!user)
        throw new ReferenceError('You inserted a user_id which does not exist');
    }
  }

  async validateDealId(dealId?: string) {
    if (dealId) {
      const deal = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: dealId },
      });
      if (!deal)
        throw new ReferenceError('You inserted a deal_id which does not exist');
    }
  }

  async saveOrUpdateTask(
    task: UnifiedCrmTaskOutput,
    connection_id: string,
  ): Promise<string> {
    const existingTask = await this.prisma.crm_tasks.findFirst({
      where: { remote_id: task.remote_id, id_connection: connection_id },
    });
    const data: any = {
      modified_at: new Date(),
      subject: task.subject,
      content: task.content,
      status: task.status,
      due_date: task.due_date,
      finished_date: task.finished_date,
      id_crm_deal: task.deal_id,
      id_crm_user: task.user_id,
      id_crm_company: task.company_id,
    };

    if (existingTask) {
      const res = await this.prisma.crm_tasks.update({
        where: { id_crm_task: existingTask.id_crm_task },
        data: data,
      });
      return res.id_crm_task;
    } else {
      data.created_at = new Date();
      data.remote_id = task.remote_id;
      data.id_connection = connection_id;
      data.id_crm_task = uuidv4();

      const newTask = await this.prisma.crm_tasks.create({ data: data });
      return newTask.id_crm_task;
    }
  }

  async getTask(
    id_task: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmTaskOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmTaskOutput format
      const unifiedTask: UnifiedCrmTaskOutput = {
        id: task.id_crm_task,
        subject: task.subject,
        content: task.content,
        status: task.status,
        due_date: task.due_date,
        finished_date: task.finished_date,
        company_id: task.id_crm_company,
        deal_id: task.id_crm_deal, // uuid of Contact object
        user_id: task.id_crm_user, // uuid of User object
        remote_id: task.remote_id,
        created_at: task.created_at,
        modified_at: task.modified_at,
      };

      let res: UnifiedCrmTaskOutput = {
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
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'crm.task.pull',
            method: 'GET',
            url: '/crm/task',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getTasks(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmTaskOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_tasks.findFirst({
          where: {
            id_connection: connection_id,
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
          id_connection: connection_id,
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

      const unifiedTasks: UnifiedCrmTaskOutput[] = await Promise.all(
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
          // Convert the map to an object
const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmTaskOutput format
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
            remote_id: task.remote_id,
            created_at: task.created_at,
            modified_at: task.modified_at,
          };
        }),
      );

      let res: UnifiedCrmTaskOutput[] = unifiedTasks;

      if (remote_data) {
        const remote_array_data: UnifiedCrmTaskOutput[] = await Promise.all(
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

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
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
}
