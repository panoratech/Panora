import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IDepartmentService } from '../types';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedAtsDepartmentOutput } from '../types/model.unified';
import { ats_departments as AtsDepartment } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
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
    this.registry.registerService('ats', 'department', this);
  }
  onModuleInit() {
    //
  }

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
    } catch (error) {
      throw error;
    }
  }
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IDepartmentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ats, commonObject: department} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsDepartmentOutput,
        OriginalDepartmentOutput,
        IDepartmentService
      >(integrationId, linkedUserId, 'ats', 'department', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    departments: UnifiedAtsDepartmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsDepartment[]> {
    try {
      const departments_results: AtsDepartment[] = [];

      const updateOrCreateDepartment = async (
        department: UnifiedAtsDepartmentOutput,
        originId: string,
      ) => {
        let existingDepartment;
        if (!originId) {
          existingDepartment = await this.prisma.ats_departments.findFirst({
            where: {
              name: department.name,
            },
          });
        } else {
          existingDepartment = await this.prisma.ats_departments.findFirst({
            where: {
              remote_id: originId,
            },
          });
        }

        const baseData: any = {
          name: department.name ?? null,
          modified_at: new Date(),
        };

        if (existingDepartment) {
          return await this.prisma.ats_departments.update({
            where: {
              id_ats_department: existingDepartment.id_ats_department,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_departments.create({
            data: {
              ...baseData,
              id_ats_department: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
            },
          });
        }
      };

      for (let i = 0; i < departments.length; i++) {
        const department = departments[i];
        const originId = department.remote_id;

        const res = await updateOrCreateDepartment(department, originId);
        const department_id = res.id_ats_department;
        departments_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          department.field_mappings,
          department_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          department_id,
          remote_data[i],
        );
      }

      return departments_results;
    } catch (error) {
      throw error;
    }
  }
}
