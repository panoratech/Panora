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
import { UnifiedCrmTaskOutput } from '../types/model.unified';
import { ITaskService } from '../types';
import { crm_tasks as CrmTask } from '@prisma/client';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { throwTypedError, SyncError } from '@@core/utils/errors';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
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
  onModuleInit() {
//
  }

  //function used by sync worker which populate our crm_tasks table
  //its role is to fetch all tasks from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = CRM_PROVIDERS;
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
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: ITaskService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:crm, commonObject: task} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmTaskOutput,
        OriginalTaskOutput,
        ITaskService
      >(integrationId, linkedUserId, 'crm', 'task', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCrmTaskOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmTask[]> {
    try {
      const tasks_results: CrmTask[] = [];

      const updateOrCreateTask = async (
        task: UnifiedCrmTaskOutput,
        originId: string,
      ) => {
        let existingTask;
        if (!originId) {
          existingTask = await this.prisma.crm_tasks.findFirst({
            where: {
              subject: task.subject,
              content: task.content,
              id_connection: connection_id,
            },
          });
        } else {
          existingTask = await this.prisma.crm_tasks.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          subject: task.subject ?? null,
          content: task.content ?? null,
          status: task.status ?? null,
          due_date: task.due_date ?? null,
          finished_date: task.finished_date ?? null,
          id_crm_deal: task.deal_id ?? null,
          id_crm_user: task.user_id ?? null,
          id_crm_company: task.company_id ?? null,
          modified_at: new Date(),
        };

        if (existingTask) {
          return await this.prisma.crm_tasks.update({
            where: {
              id_crm_task: existingTask.id_crm_task,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.crm_tasks.create({
            data: {
              ...baseData,
              id_crm_task: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const task = data[i];
        const originId = task.remote_id;

        const res = await updateOrCreateTask(task, originId);
        const task_id = res.id_crm_task;
        tasks_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          task.field_mappings,
          task_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(task_id, remote_data[i]);
      }
      return tasks_results;
    } catch (error) {
      throw error;
    }
  }
}
