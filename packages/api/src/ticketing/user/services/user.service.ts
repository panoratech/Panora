import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedTicketingUserOutput } from '../types/model.unified';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_ticketing_user: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingUserOutput> {
    try {
      this.logger.debug(`Fetching user by ID: ${id_ticketing_user}`);
      const user = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: id_ticketing_user,
        },
      });

      if (!user) {
        this.logger.warn(`User not found: ${id_ticketing_user}`);
        throw new ReferenceError('User undefined');
      }

      this.logger.debug(`Fetching field mappings for user: ${user.id_tcg_user}`);
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: user.id_tcg_user,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Object.fromEntries(fieldMappingsMap);

      const unifiedUser: UnifiedTicketingUserOutput = {
        id: user.id_tcg_user,
        email_address: user.email_address,
        name: user.name,
        teams: user.teams,
        field_mappings: field_mappings,
        remote_id: user.remote_id,
        created_at: user.created_at,
        modified_at: user.modified_at,
      };

      if (remote_data) {
        this.logger.debug(`Fetching remote data for user: ${user.id_tcg_user}`);
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: user.id_tcg_user,
          },
        });
        const remote_data = JSON.parse(resp.data);

        unifiedUser.remote_data = remote_data;
      }

      this.logger.log('Logging event for user fetch');
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.user.pull',
          method: 'GET',
          url: '/ticketing/user',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return unifiedUser;
    } catch (error) {
      this.logger.error('Error in getUser method', error.stack);
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
    data: UnifiedTicketingUserOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      this.logger.debug(`Fetching users for connection: ${connection_id}, cursor: ${cursor}, limit: ${limit}`);

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        this.logger.debug(`Validating cursor: ${cursor}`);
        const isCursorPresent = await this.prisma.tcg_users.findFirst({
          where: {
            id_connection: connection_id,
            id_tcg_user: cursor,
          },
        });
        if (!isCursorPresent) {
          this.logger.warn(`Invalid cursor provided: ${cursor}`);
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const users = await this.prisma.tcg_users.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_user: cursor,
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
        next_cursor = Buffer.from(users[users.length - 1].id_tcg_user).toString(
          'base64',
        );
        users.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedUsers: UnifiedTicketingUserOutput[] = await Promise.all(
        users.map(async (user) => {
          this.logger.debug(`Fetching field mappings for user: ${user.id_tcg_user}`);
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: user.id_tcg_user,
              },
            },
            include: {
              attribute: true,
            },
          });

          const fieldMappingsMap = new Map();
          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          const field_mappings = Object.fromEntries(fieldMappingsMap);

          return {
            id: user.id_tcg_user,
            email_address: user.email_address,
            name: user.name,
            teams: user.teams,
            field_mappings: field_mappings,
            remote_id: user.remote_id,
            created_at: user.created_at,
            modified_at: user.modified_at,
          };
        }),
      );

      let res: UnifiedTicketingUserOutput[] = unifiedUsers;

      if (remote_data) {
        this.logger.debug('Fetching remote data for users');
        const remote_array_data: UnifiedTicketingUserOutput[] = await Promise.all(
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

      this.logger.log('Logging event for users fetch');
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.user.pull',
          method: 'GET',
          url: '/ticketing/users',
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
      this.logger.error('Error in getUsers method', error.stack);
      throw error;
    }
  }
}
