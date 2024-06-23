import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedDepartmentOutput } from '../types/model.unified';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(DepartmentService.name);
  }

  async getDepartment(
    id_ats_department: string,
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getDepartments(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<UnifiedDepartmentOutput[]> {
    try {
      const departments = await this.prisma.ats_departments.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
