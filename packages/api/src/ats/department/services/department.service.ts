import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedDepartmentOutput } from '../types/model.unified';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(DepartmentService.name);
  }

  async getDepartment(
    id_ats_department: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDepartmentOutput> {
    try {
      const department = await this.prisma.ats_departments.findUnique({
        where: {
          id_ats_department: id_ats_department,
        },
      });

      if (!department) {
        throw new Error(`Department with ID ${id_ats_department} not found.`);
      }

      // Fetch field mappings for the department
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: department.id_ats_department,
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedDepartmentOutput format
      const unifiedDepartment: UnifiedDepartmentOutput = {
        id: department.id_ats_department,
        name: department.name,
        field_mappings: field_mappings,
        remote_id: department.remote_id,
        created_at: department.created_at,
        modified_at: department.modified_at,
      };

      let res: UnifiedDepartmentOutput = unifiedDepartment;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: department.id_ats_department,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.department.pull',
          method: 'GET',
          url: '/ats/department',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getDepartments(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedDepartmentOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_departments.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_department: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const departments = await this.prisma.ats_departments.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_department: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (departments.length === limit + 1) {
        next_cursor = Buffer.from(
          departments[departments.length - 1].id_ats_department,
        ).toString('base64');
        departments.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedDepartments: UnifiedDepartmentOutput[] = await Promise.all(
        departments.map(async (department) => {
          // Fetch field mappings for the department
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: department.id_ats_department,
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
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedDepartmentOutput format
          return {
            id: department.id_ats_department,
            name: department.name,
            field_mappings: field_mappings,
            remote_id: department.remote_id,
            created_at: department.created_at,
            modified_at: department.modified_at,
          };
        }),
      );

      let res: UnifiedDepartmentOutput[] = unifiedDepartments;

      if (remote_data) {
        const remote_array_data: UnifiedDepartmentOutput[] = await Promise.all(
          res.map(async (department) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: department.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...department, remote_data };
          }),
        );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.department.pull',
          method: 'GET',
          url: '/ats/departments',
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
