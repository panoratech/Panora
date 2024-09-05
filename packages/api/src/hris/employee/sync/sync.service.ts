import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisEmployeeOutput } from '../types/model.unified';
import { IEmployeeService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_employees as HrisEmployee } from '@prisma/client';
import { OriginalEmployeeOutput } from '@@core/utils/types/original/original.hris';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('hris', 'employee', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
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
          const providers = HRIS_PROVIDERS;
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
      const { integrationId, linkedUserId, id_company } = param;
      const service: IEmployeeService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisEmployeeOutput,
        OriginalEmployeeOutput,
        IEmployeeService
      >(integrationId, linkedUserId, 'hris', 'employee', service, [
        {
          param: id_company,
          paramName: 'id_company',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    employees: UnifiedHrisEmployeeOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisEmployee[]> {
    try {
      const employeeResults: HrisEmployee[] = [];

      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const originId = employee.remote_id;

        let existingEmployee = await this.prisma.hris_employees.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const employeeData = {
          groups: employee.groups || [],
          employee_number: employee.employee_number,
          id_hris_company: employee.company_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          preferred_name: employee.preferred_name,
          display_full_name: employee.display_full_name,
          username: employee.username,
          work_email: employee.work_email,
          personal_email: employee.personal_email,
          mobile_phone_number: employee.mobile_phone_number,
          employments: employee.employments || [],
          ssn: employee.ssn,
          gender: employee.gender,
          manager_id: employee.manager_id,
          ethnicity: employee.ethnicity,
          marital_status: employee.marital_status,
          date_of_birth: employee.date_of_birth
            ? new Date(employee.date_of_birth)
            : null,
          start_date: employee.start_date
            ? new Date(employee.start_date)
            : null,
          employment_status: employee.employment_status,
          termination_date: employee.termination_date
            ? new Date(employee.termination_date)
            : null,
          avatar_url: employee.avatar_url,
          remote_id: originId,
          remote_created_at: employee.remote_created_at
            ? new Date(employee.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: employee.remote_was_deleted || false,
        };

        if (existingEmployee) {
          existingEmployee = await this.prisma.hris_employees.update({
            where: { id_hris_employee: existingEmployee.id_hris_employee },
            data: employeeData,
          });
        } else {
          existingEmployee = await this.prisma.hris_employees.create({
            data: {
              ...employeeData,
              id_hris_employee: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        employeeResults.push(existingEmployee);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          employee.field_mappings,
          existingEmployee.id_hris_employee,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingEmployee.id_hris_employee,
          remote_data[i],
        );
      }

      return employeeResults;
    } catch (error) {
      throw error;
    }
  }
}
