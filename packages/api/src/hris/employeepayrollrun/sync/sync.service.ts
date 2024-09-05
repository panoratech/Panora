import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisEmployeepayrollrunOutput } from '../types/model.unified';
import { IEmployeePayrollRunService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_employee_payroll_runs as HrisEmployeePayrollRun } from '@prisma/client';
import { OriginalEmployeePayrollRunOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'employeepayrollrun', this);
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
      const { integrationId, linkedUserId } = param;
      const service: IEmployeePayrollRunService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisEmployeepayrollrunOutput,
        OriginalEmployeePayrollRunOutput,
        IEmployeePayrollRunService
      >(integrationId, linkedUserId, 'hris', 'employeepayrollrun', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    employeePayrollRuns: UnifiedHrisEmployeepayrollrunOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisEmployeePayrollRun[]> {
    try {
      const employeePayrollRunResults: HrisEmployeePayrollRun[] = [];

      for (let i = 0; i < employeePayrollRuns.length; i++) {
        const employeePayrollRun = employeePayrollRuns[i];
        const originId = employeePayrollRun.remote_id;

        let existingEmployeePayrollRun =
          await this.prisma.hris_employee_payroll_runs.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const employeePayrollRunData = {
          id_hris_employee: employeePayrollRun.employee_id,
          id_hris_payroll_run: employeePayrollRun.payroll_run_id,
          gross_pay: employeePayrollRun.gross_pay
            ? BigInt(employeePayrollRun.gross_pay)
            : null,
          net_pay: employeePayrollRun.net_pay
            ? BigInt(employeePayrollRun.net_pay)
            : null,
          start_date: employeePayrollRun.start_date
            ? new Date(employeePayrollRun.start_date)
            : null,
          end_date: employeePayrollRun.end_date
            ? new Date(employeePayrollRun.end_date)
            : null,
          check_date: employeePayrollRun.check_date
            ? new Date(employeePayrollRun.check_date)
            : null,
          remote_id: originId,
          remote_created_at: employeePayrollRun.remote_created_at
            ? new Date(employeePayrollRun.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: employeePayrollRun.remote_was_deleted || false,
        };

        if (existingEmployeePayrollRun) {
          existingEmployeePayrollRun =
            await this.prisma.hris_employee_payroll_runs.update({
              where: {
                id_hris_employee_payroll_run:
                  existingEmployeePayrollRun.id_hris_employee_payroll_run,
              },
              data: employeePayrollRunData,
            });
        } else {
          existingEmployeePayrollRun =
            await this.prisma.hris_employee_payroll_runs.create({
              data: {
                ...employeePayrollRunData,
                id_hris_employee_payroll_run: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        employeePayrollRunResults.push(existingEmployeePayrollRun);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          employeePayrollRun.field_mappings,
          existingEmployeePayrollRun.id_hris_employee_payroll_run,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingEmployeePayrollRun.id_hris_employee_payroll_run,
          remote_data[i],
        );

        // Process deductions, earnings, and taxes
        await this.processDeductions(
          existingEmployeePayrollRun.id_hris_employee_payroll_run,
          employeePayrollRun.deductions,
        );
        await this.processEarnings(
          existingEmployeePayrollRun.id_hris_employee_payroll_run,
          employeePayrollRun.earnings,
        );
        await this.processTaxes(
          existingEmployeePayrollRun.id_hris_employee_payroll_run,
          employeePayrollRun.taxes,
        );
      }

      return employeePayrollRunResults;
    } catch (error) {
      throw error;
    }
  }

  private async processDeductions(
    id_hris_employee_payroll_run: string,
    deductions: any[],
  ) {
    // Implementation for processing deductions
  }

  private async processEarnings(
    id_hris_employee_payroll_run: string,
    earnings: any[],
  ) {
    // Implementation for processing earnings
  }

  private async processTaxes(
    id_hris_employee_payroll_run: string,
    taxes: any[],
  ) {
    // Implementation for processing taxes
  }
}
