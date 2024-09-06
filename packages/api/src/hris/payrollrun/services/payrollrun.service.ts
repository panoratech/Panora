import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisPayrollrunOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class PayrollRunService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(PayrollRunService.name);
  }

  async getPayrollRun(
    id_hris_payroll_run: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisPayrollrunOutput> {
    try {
      const payrollRun = await this.prisma.hris_payroll_runs.findUnique({
        where: { id_hris_payroll_run: id_hris_payroll_run },
      });

      if (!payrollRun) {
        throw new Error(`PayrollRun with ID ${id_hris_payroll_run} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: payrollRun.id_hris_payroll_run,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedPayrollRun: UnifiedHrisPayrollrunOutput = {
        id: payrollRun.id_hris_payroll_run,
        run_state: payrollRun.run_state,
        run_type: payrollRun.run_type,
        start_date: payrollRun.start_date,
        end_date: payrollRun.end_date,
        check_date: payrollRun.check_date,
        field_mappings: field_mappings,
        remote_id: payrollRun.remote_id,
        remote_created_at: payrollRun.remote_created_at,
        created_at: payrollRun.created_at,
        modified_at: payrollRun.modified_at,
        remote_was_deleted: payrollRun.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: payrollRun.id_hris_payroll_run,
          },
        });
        unifiedPayrollRun.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.payrollrun.pull',
          method: 'GET',
          url: '/hris/payrollrun',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedPayrollRun;
    } catch (error) {
      throw error;
    }
  }

  async getPayrollRuns(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisPayrollrunOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const payrollRuns = await this.prisma.hris_payroll_runs.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_payroll_run: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = payrollRuns.length > limit;
      if (hasNextPage) payrollRuns.pop();

      const unifiedPayrollRuns = await Promise.all(
        payrollRuns.map(async (payrollRun) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: payrollRun.id_hris_payroll_run,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedPayrollRun: UnifiedHrisPayrollrunOutput = {
            id: payrollRun.id_hris_payroll_run,
            run_state: payrollRun.run_state,
            run_type: payrollRun.run_type,
            start_date: payrollRun.start_date,
            end_date: payrollRun.end_date,
            check_date: payrollRun.check_date,
            field_mappings: field_mappings,
            remote_id: payrollRun.remote_id,
            remote_created_at: payrollRun.remote_created_at,
            created_at: payrollRun.created_at,
            modified_at: payrollRun.modified_at,
            remote_was_deleted: payrollRun.remote_was_deleted,
          };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: payrollRun.id_hris_payroll_run,
              },
            });
            unifiedPayrollRun.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedPayrollRun;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.payrollrun.pull',
          method: 'GET',
          url: '/hris/payrollruns',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedPayrollRuns,
        next_cursor: hasNextPage
          ? payrollRuns[payrollRuns.length - 1].id_hris_payroll_run
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
