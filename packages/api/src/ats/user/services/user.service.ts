import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedAtsUserOutput, UserAccessRole } from '../types/model.unified';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_ats_user: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedAtsUserOutput> {
    try {
      const user = await this.prisma.ats_users.findUnique({
        where: {
          id_ats_user: id_ats_user,
        },
      });

      if (!user) {
        throw new Error(`User with ID ${id_ats_user} not found.`);
      }

      // Fetch field mappings for the user
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: user.id_ats_user,
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

      // Transform to UnifiedAtsUserOutput format
      const unifiedUser: UnifiedAtsUserOutput = {
        id: user.id_ats_user,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        disabled: user.disabled,
        access_role: user.access_role,
        remote_created_at: String(user.remote_created_at),
        remote_modified_at: String(user.remote_modified_at),
        field_mappings: field_mappings,
        remote_id: user.remote_id,
        created_at: user.created_at,
        modified_at: user.modified_at,
      };

      let res: UnifiedAtsUserOutput = unifiedUser;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: user.id_ats_user,
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
          type: 'ats.user.pull',
          method: 'GET',
          url: '/ats/user',
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
    data: UnifiedAtsUserOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_users.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_user: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const users = await this.prisma.ats_users.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_user: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {},
      });

      if (users.length === limit + 1) {
        next_cursor = Buffer.from(users[users.length - 1].id_ats_user).toString(
          'base64',
        );
        users.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }
      const unifiedUsers: UnifiedAtsUserOutput[] = await Promise.all(
        users.map(async (user) => {
          // Fetch field mappings for the user
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: user.id_ats_user,
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

          // Transform to UnifiedAtsUserOutput format
          return {
            id: user.id_ats_user,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            disabled: user.disabled,
            access_role: user.access_role,
            remote_created_at: String(user.remote_created_at),
            remote_modified_at: String(user.remote_modified_at),
            field_mappings: field_mappings,
            remote_id: user.remote_id,
            created_at: user.created_at,
            modified_at: user.modified_at,
          };
        }),
      );

      let res: UnifiedAtsUserOutput[] = unifiedUsers;

      if (remote_data) {
        const remote_array_data: UnifiedAtsUserOutput[] = await Promise.all(
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
          type: 'ats.user.pull',
          method: 'GET',
          url: '/ats/users',
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
