import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedFilestorageUserOutput } from '../types/model.unified';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_fs_user: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageUserOutput> {
    try {
      const user = await this.prisma.fs_users.findUnique({
        where: {
          id_fs_user: id_fs_user,
        },
      });

      if (!user) {
        throw new Error(`User with ID ${id_fs_user} not found.`);
      }

      // Fetch field mappings for the user
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: user.id_fs_user,
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

      // Transform to UnifiedFilestorageUserOutput format
      const unifiedUser: UnifiedFilestorageUserOutput = {
        id: user.id_fs_user,
        name: user.name,
        email: user.email,
        is_me: user.is_me,
        field_mappings: field_mappings,
        remote_id: user.remote_id,
        created_at: user.created_at,
        modified_at: user.modified_at,
      };

      let res: UnifiedFilestorageUserOutput = unifiedUser;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: user.id_fs_user,
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
          type: 'filestorage.user.pull',
          method: 'GET',
          url: '/filestorage/user',
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

  async getUsers(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageUserOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_users.findFirst({
          where: {
            id_connection: connection_id,
            id_fs_user: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const users = await this.prisma.fs_users.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_user: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (users.length === limit + 1) {
        next_cursor = Buffer.from(users[users.length - 1].id_fs_user).toString(
          'base64',
        );
        users.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }
      const unifiedUsers: UnifiedFilestorageUserOutput[] = await Promise.all(
        users.map(async (user) => {
          // Fetch field mappings for the user
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: user.id_fs_user,
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

          // Transform to UnifiedFilestorageUserOutput format
          return {
            id: user.id_fs_user,
            name: user.name,
            email: user.email,
            is_me: user.is_me,
            field_mappings: field_mappings,
            remote_id: user.remote_id,
            created_at: user.created_at,
            modified_at: user.modified_at,
          };
        }),
      );

      let res: UnifiedFilestorageUserOutput[] = unifiedUsers;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageUserOutput[] =
          await Promise.all(
            res.map(async (user) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: user.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...user, remote_data };
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
          type: 'filestorage.user.pull',
          method: 'GET',
          url: '/filestorage/users',
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
