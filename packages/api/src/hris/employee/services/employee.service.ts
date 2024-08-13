import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalEmployeeOutput } from '@@core/utils/types/original/original.hris';
import { HrisObject } from '@panora/shared';
import { IEmployeeService } from '../types';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(EmployeeService.name);
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async addEmployee(
    unifiedEmployeeData: UnifiedHrisEmployeeInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmployeeOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedHrisEmployeeInput>({
          sourceObject: unifiedEmployeeData,
          targetType: HrisObject.employee,
          providerName: integrationId,
          vertical: 'hris',
          customFieldMappings: [],
        });

      const service: IEmployeeService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalEmployeeOutput> =
        await service.addEmployee(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalEmployeeOutput[]
      >({
        sourceObject: [resp.data],
        targetType: HrisObject.employee,
        providerName: integrationId,
        vertical: 'hris',
        connectionId: connection_id,
        customFieldMappings: [],
      })) as UnifiedHrisEmployeeOutput[];

      const source_employee = resp.data;
      const target_employee = unifiedObject[0];

      const unique_hris_employee_id = await this.saveOrUpdateEmployee(
        target_employee,
        connection_id,
      );

      await this.ingestService.processRemoteData(
        unique_hris_employee_id,
        source_employee,
      );

      const result_employee = await this.getEmployee(
        unique_hris_employee_id,
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
          type: 'hris.employee.push',
          method: 'POST',
          url: '/hris/employees',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.dispatchWebhook(
        result_employee,
        'hris.employee.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_employee;
    } catch (error) {
      throw error;
    }
  }

  async saveOrUpdateEmployee(
    employee: UnifiedHrisEmployeeOutput,
    connectionId: string,
  ): Promise<string> {
    const existingEmployee = await this.prisma.hris_employees.findFirst({
      where: { remote_id: employee.remote_id, id_connection: connectionId },
    });

    const data: any = {
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
      ethnicity: employee.ethnicity,
      marital_status: employee.marital_status,
      date_of_birth: employee.date_of_birth,
      start_date: employee.start_date,
      employment_status: employee.employment_status,
      termination_date: employee.termination_date,
      avatar_url: employee.avatar_url,
      modified_at: new Date(),
    };

    if (existingEmployee) {
      const res = await this.prisma.hris_employees.update({
        where: { id_hris_employee: existingEmployee.id_hris_employee },
        data: data,
      });

      return res.id_hris_employee;
    } else {
      data.created_at = new Date();
      data.remote_id = employee.remote_id;
      data.id_connection = connectionId;
      data.id_hris_employee = uuidv4();
      data.remote_was_deleted = employee.remote_was_deleted ?? false;
      data.remote_created_at = employee.remote_created_at
        ? new Date(employee.remote_created_at)
        : null;

      const newEmployee = await this.prisma.hris_employees.create({
        data: data,
      });

      return newEmployee.id_hris_employee;
    }
  }

  async getEmployee(
    id_hris_employee: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedHrisEmployeeOutput> {
    try {
      const employee = await this.prisma.hris_employees.findUnique({
        where: { id_hris_employee: id_hris_employee },
      });

      if (!employee) {
        throw new Error(`Employee with ID ${id_hris_employee} not found.`);
      }

      const values = await this.prisma.value.findMany({
        where: {
          entity: { ressource_owner_id: employee.id_hris_employee },
        },
        include: { attribute: true },
      });

      const field_mappings = Object.fromEntries(
        values.map((value) => [value.attribute.slug, value.data]),
      );

      const locations = await this.prisma.hris_locations.findMany({
        where: {
          id_hris_employee: employee.id_hris_employee,
        },
      });

      const unifiedEmployee: UnifiedHrisEmployeeOutput = {
        id: employee.id_hris_employee,
        groups: employee.groups,
        employee_number: employee.employee_number,
        company_id: employee.id_hris_company,
        first_name: employee.first_name,
        last_name: employee.last_name,
        preferred_name: employee.preferred_name,
        display_full_name: employee.display_full_name,
        username: employee.username,
        work_email: employee.work_email,
        personal_email: employee.personal_email,
        mobile_phone_number: employee.mobile_phone_number,
        employments: employee.employments,
        ssn: employee.ssn,
        manager_id: employee.manager,
        gender: employee.gender,
        ethnicity: employee.ethnicity,
        marital_status: employee.marital_status,
        date_of_birth: employee.date_of_birth,
        start_date: employee.start_date,
        employment_status: employee.employment_status,
        termination_date: employee.termination_date,
        avatar_url: employee.avatar_url,
        locations: locations.map((loc) => loc.id_hris_location),
        field_mappings: field_mappings,
        remote_id: employee.remote_id,
        remote_created_at: employee.remote_created_at,
        created_at: employee.created_at,
        modified_at: employee.modified_at,
        remote_was_deleted: employee.remote_was_deleted,
      };

      if (remote_data) {
        const remoteDataRecord = await this.prisma.remote_data.findFirst({
          where: { ressource_owner_id: employee.id_hris_employee },
        });
        unifiedEmployee.remote_data = remoteDataRecord
          ? JSON.parse(remoteDataRecord.data)
          : null;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employee.pull',
          method: 'GET',
          url: '/hris/employee',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return unifiedEmployee;
    } catch (error) {
      throw error;
    }
  }

  async getEmployees(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedHrisEmployeeOutput[];
    next_cursor: string | null;
    previous_cursor: string | null;
  }> {
    try {
      const employees = await this.prisma.hris_employees.findMany({
        take: limit + 1,
        cursor: cursor ? { id_hris_employee: cursor } : undefined,
        where: { id_connection: connectionId },
        orderBy: { created_at: 'asc' },
      });

      const hasNextPage = employees.length > limit;
      if (hasNextPage) employees.pop();

      const unifiedEmployees = await Promise.all(
        employees.map(async (employee) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: { ressource_owner_id: employee.id_hris_employee },
            },
            include: { attribute: true },
          });

          const field_mappings = Object.fromEntries(
            values.map((value) => [value.attribute.slug, value.data]),
          );

          const locations = await this.prisma.hris_locations.findMany({
            where: {
              id_hris_employee: employee.id_hris_employee,
            },
          });

          const unifiedEmployee: UnifiedHrisEmployeeOutput = {
            id: employee.id_hris_employee,
            groups: employee.groups,
            employee_number: employee.employee_number,
            company_id: employee.id_hris_company,
            first_name: employee.first_name,
            last_name: employee.last_name,
            preferred_name: employee.preferred_name,
            display_full_name: employee.display_full_name,
            username: employee.username,
            locations: locations.map((loc) => loc.id_hris_location),
            manager_id: employee.manager,
            work_email: employee.work_email,
            personal_email: employee.personal_email,
            mobile_phone_number: employee.mobile_phone_number,
            employments: employee.employments,
            ssn: employee.ssn,
            gender: employee.gender,
            ethnicity: employee.ethnicity,
            marital_status: employee.marital_status,
            date_of_birth: employee.date_of_birth,
            start_date: employee.start_date,
            employment_status: employee.employment_status,
            termination_date: employee.termination_date,
            avatar_url: employee.avatar_url,
            field_mappings: field_mappings,
            remote_id: employee.remote_id,
            remote_created_at: employee.remote_created_at,
          };
          if (remote_data) {
            const remoteDataRecord = await this.prisma.remote_data.findFirst({
              where: { ressource_owner_id: employee.id_hris_employee },
            });
            unifiedEmployee.remote_data = remoteDataRecord
              ? JSON.parse(remoteDataRecord.data)
              : null;
          }

          return unifiedEmployee;
        }),
      );

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'hris.employee.pull',
          method: 'GET',
          url: '/hris/employees',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
          id_project: projectId,
          id_connection: connectionId,
        },
      });

      return {
        data: unifiedEmployees,
        next_cursor: hasNextPage
          ? employees[employees.length - 1].id_hris_employee
          : null,
        previous_cursor: cursor ?? null,
      };
    } catch (error) {
      throw error;
    }
  }
}
