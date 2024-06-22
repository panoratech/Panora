import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { UnifiedUserOutput } from '../types/model.unified';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_ticketing_user: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput> {
    try {
      const user = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: id_ticketing_user,
        },
      });

      if (!user) throw new ReferenceError('User undefined');

      // Fetch field mappings for the ticket
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

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedUserOutput format
      const unifiedUser: UnifiedUserOutput = {
        id: user.id_tcg_user,
        email_address: user.email_address,
        name: user.name,
        teams: user.teams,
        field_mappings: field_mappings,
      };

      let res: UnifiedUserOutput = unifiedUser;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: user.id_tcg_user,
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

  async getUsers(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedUserOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_users.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_user: cursor,
          },
        });
        if (!isCursorPresent) {
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
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
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

      const unifiedUsers: UnifiedUserOutput[] = await Promise.all(
        users.map(async (user) => {
          // Fetch field mappings for the user
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
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedUserOutput format
          return {
            id: user.id_tcg_user,
            email_address: user.email_address,
            name: user.name,
            teams: user.teams,
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedUserOutput[] = unifiedUsers;

      if (remote_data) {
        const remote_array_data: UnifiedUserOutput[] = await Promise.all(
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

      const event = await this.prisma.events.create({
        data: {
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
      throw error;
    }
  }
}
