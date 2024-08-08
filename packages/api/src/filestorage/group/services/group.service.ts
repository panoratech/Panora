import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedFilestorageGroupOutput } from '../types/model.unified';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(GroupService.name);
  }
  async getGroup(
    id_fs_group: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageGroupOutput> {
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
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      let usersArray;
      if (group.users) {
        const fetchedUsers = await Promise.all(
          (group.users as string[]).map(async (uuid) => {
            const user = await this.prisma.fs_users.findUnique({
              where: {
                id_fs_user: uuid,
              },
            });
            return user;
          }),
        );
        usersArray = await Promise.all(fetchedUsers);
      }

      // Transform to UnifiedFilestorageGroupOutput format
      const unifiedGroup: UnifiedFilestorageGroupOutput = {
        id: group.id_fs_group,
        name: group.name,
        users: usersArray,
        remote_was_deleted: group.remote_was_deleted,
        field_mappings: field_mappings,
        remote_id: group.remote_id,
        created_at: group.created_at,
        modified_at: group.modified_at,
      };

      let res: UnifiedFilestorageGroupOutput = unifiedGroup;
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
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.group.pull',
          method: 'GET',
          url: '/filestorage/group',
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

  async getGroups(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: any,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageGroupOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_groups.findFirst({
          where: {
            id_connection: connection_id,
            id_fs_group: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const groups = await this.prisma.fs_groups.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_group: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (groups.length === limit + 1) {
        next_cursor = Buffer.from(
          groups[groups.length - 1].id_fs_group,
        ).toString('base64');
        groups.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedGroups: UnifiedFilestorageGroupOutput[] = await Promise.all(
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
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          let usersArray;
          if (group.users) {
            const fetchedUsers = await Promise.all(
              (group.users as string[]).map(async (uuid) => {
                const user = await this.prisma.fs_users.findUnique({
                  where: {
                    id_fs_user: uuid,
                  },
                });
                return user;
              }),
            );
            usersArray = await Promise.all(fetchedUsers);
          }

          // Transform to UnifiedFilestorageGroupOutput format
          return {
            id: group.id_fs_group,
            name: group.name,
            users: usersArray,
            remote_was_deleted: group.remote_was_deleted,
            field_mappings: field_mappings,
            remote_id: group.remote_id,
            created_at: group.created_at,
            modified_at: group.modified_at,
          };
        }),
      );

      let res: UnifiedFilestorageGroupOutput[] = unifiedGroups;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageGroupOutput[] =
          await Promise.all(
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
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.group.pull',
          method: 'GET',
          url: '/filestorage/groups',
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
