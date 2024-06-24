import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedGroupOutput } from '../types/model.unified';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(GroupService.name);
  }

  async getGroup(
    id_fs_group: string,
    remote_data?: boolean,
  ): Promise<UnifiedGroupOutput> {
    try {
      const group = await this.prisma.fs_groups.findUnique({
        where: {
          id_fs_group: id_fs_group,
        },
      });

      if (!group) {
        throw new Error(`Group with ID ${id_fs_group} not found.`);
      }

      // Fetch field mappings for the group
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: group.id_fs_group,
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

      // Transform to UnifiedGroupOutput format
      const unifiedGroup: UnifiedGroupOutput = {
        id: group.id_fs_group,
        name: group.name,
        users: group.users,
        remote_was_deleted: group.remote_was_deleted,
        field_mappings: field_mappings,
        remote_id: group.remote_id,
        created_at: group.created_at,
        modified_at: group.modified_at,
      };

      let res: UnifiedGroupOutput = unifiedGroup;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: group.id_fs_group,
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

  async getGroups(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: any,
    cursor?: string,
  ): Promise<UnifiedGroupOutput[]> {
    try {
      const groups = await this.prisma.fs_groups.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedGroups: UnifiedGroupOutput[] = await Promise.all(
        groups.map(async (group) => {
          // Fetch field mappings for the group
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: group.id_fs_group,
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

          // Transform to UnifiedGroupOutput format
          return {
            id: group.id_fs_group,
            name: group.name,
            users: group.users as string[],
            remote_was_deleted: group.remote_was_deleted,
            field_mappings: field_mappings,
            remote_id: group.remote_id,
            created_at: group.created_at,
            modified_at: group.modified_at,
          };
        }),
      );

      let res: UnifiedGroupOutput[] = unifiedGroups;

      if (remote_data) {
        const remote_array_data: UnifiedGroupOutput[] = await Promise.all(
          res.map(async (group) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: group.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...group, remote_data };
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
