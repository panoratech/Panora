import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedHrisEmployeepayrollrunOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class EmployeePayrollRunService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployeePayrollRunService.name);
  }

  async getEmployeePayrollRun(
    id_hris_employee_payroll_run: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmployeepayrollrunOutput> {
    try {
      const employeePayrollRun =
        await this.prisma.hris_employee_payroll_runs.findUnique({
          where: { id_hris_employee_payroll_run: id_hris_employee_payroll_run },
          include: {
            hris_employee_payroll_runs_deductions: true,
            hris_employee_payroll_runs_earnings: true,
            hris_employee_payroll_runs_taxes: true,
          },
        });

      if (!employeePayrollRun) {
        throw new Error(
          `Employee Payroll Run with ID ${id_hris_employee_payroll_run} not found.`,
        );
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: employeePayrollRun.id_hris_employee_payroll_run,
          },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const unifiedEmployeePayrollRun: UnifiedHrisEmployeepayrollrunOutput = {
        id: employeePayrollRun.id_hris_employee_payroll_run,
        employee_id: employeePayrollRun.id_hris_employee,
        payroll_run_id: employeePayrollRun.id_hris_payroll_run,
        gross_pay: Number(employeePayrollRun.gross_pay),
        net_pay: Number(employeePayrollRun.net_pay),
        start_date: employeePayrollRun.start_date,
        end_date: employeePayrollRun.end_date,
        check_date: employeePayrollRun.check_date,
        deductions:
          employeePayrollRun.hris_employee_payroll_runs_deductions.map((d) => ({
            name: d.name,
            employee_deduction: Number(d.employee_deduction),
            company_deduction: Number(d.company_deduction),
          })),
        earnings: employeePayrollRun.hris_employee_payroll_runs_earnings.map(
          (e) => ({
            amount: Number(e.amount),
            type: e.type,
          }),
        ),
        taxes: employeePayrollRun.hris_employee_payroll_runs_taxes.map((t) => ({
          name: t.name,
          amount: Number(t.amount),
          employer_tax: t.employer_tax,
        })),
        field_mappings: field_mappings,
        remote_id: employeePayrollRun.remote_id,
        remote_created_at: employeePayrollRun.remote_created_at,
        created_at: employeePayrollRun.created_at,
        modified_at: employeePayrollRun.modified_at,
        remote_was_deleted: employeePayrollRun.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: employeePayrollRun.id_hris_employee_payroll_run,
          },
        });
        unifiedEmployeePayrollRun.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employee_payroll_run.pull',
          method: 'GET',
          url: '/hris/employee_payroll_run',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedEmployeePayrollRun;
    } catch (error) {
      throw error;
    }
  }

  async getEmployeePayrollRuns(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisEmployeepayrollrunOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const employeePayrollRuns =
        await this.prisma.hris_employee_payroll_runs.findMany({
          take: limit + 1,
          cursor: cursor ? { id_hris_employee_payroll_run: cursor } : undefined,
          where: { id_connection: connectionId },
          orderBy: { created_at: 'asc' },
          include: {
            hris_employee_payroll_runs_deductions: true,
            hris_employee_payroll_runs_earnings: true,
            hris_employee_payroll_runs_taxes: true,
          },
        });

      const hasNextPage = employeePayrollRuns.length > limit;
      if (hasNextPage) employeePayrollRuns.pop();

      const unifiedEmployeePayrollRuns = await Promise.all(
        employeePayrollRuns.map(async (employeePayrollRun) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id:
                  employeePayrollRun.id_hris_employee_payroll_run,
              },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const unifiedEmployeePayrollRun: UnifiedHrisEmployeepayrollrunOutput =
            {
              id: employeePayrollRun.id_hris_employee_payroll_run,
              employee_id: employeePayrollRun.id_hris_employee,
              payroll_run_id: employeePayrollRun.id_hris_payroll_run,
              gross_pay: Number(employeePayrollRun.gross_pay),
              net_pay: Number(employeePayrollRun.net_pay),
              start_date: employeePayrollRun.start_date,
              end_date: employeePayrollRun.end_date,
              check_date: employeePayrollRun.check_date,
              deductions:
                employeePayrollRun.hris_employee_payroll_runs_deductions.map(
                  (d) => ({
                    name: d.name,
                    employee_deduction: Number(d.employee_deduction),
                    company_deduction: Number(d.company_deduction),
                  }),
                ),
              earnings:
                employeePayrollRun.hris_employee_payroll_runs_earnings.map(
                  (e) => ({
                    amount: Number(e.amount),
                    type: e.type,
                  }),
                ),
              taxes: employeePayrollRun.hris_employee_payroll_runs_taxes.map(
                (t) => ({
                  name: t.name,
                  amount: Number(t.amount),
                  employer_tax: t.employer_tax,
                }),
              ),
              field_mappings: field_mappings,
              remote_id: employeePayrollRun.remote_id,
              remote_created_at: employeePayrollRun.remote_created_at,
              created_at: employeePayrollRun.created_at,
              modified_at: employeePayrollRun.modified_at,
              remote_was_deleted: employeePayrollRun.remote_was_deleted,
            };

          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id:
                  employeePayrollRun.id_hris_employee_payroll_run,
              },
            });
            unifiedEmployeePayrollRun.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedEmployeePayrollRun;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employee_payroll_run.pull',
          method: 'GET',
          url: '/hris/employee_payroll_runs',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedEmployeePayrollRuns,
        next_cursor: hasNextPage
          ? employeePayrollRuns[employeePayrollRuns.length - 1]
              .id_hris_employee_payroll_run
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
