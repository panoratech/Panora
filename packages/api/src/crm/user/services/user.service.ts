import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedCrmUserOutput } from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_user: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmUserOutput> {
    try {
      const user = await this.prisma.crm_users.findUnique({
        where: {
          id_crm_user: id_user,
        },
      });

      // Fetch field mappings for the user
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: user.id_crm_user,
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

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmUserOutput format
      const unifiedUser: UnifiedCrmUserOutput = {
        id: user.id_crm_user,
        name: user.name,
        email: user.email,
        field_mappings: field_mappings,
        remote_id: user.remote_id,
        created_at: user.created_at,
        modified_at: user.modified_at,
      };

      let res: UnifiedCrmUserOutput = {
        ...unifiedUser,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: user.id_crm_user,
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
          type: 'crm.user.pull',
          method: 'GET',
          url: '/crm/user',
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
    data: UnifiedCrmUserOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_users.findFirst({
          where: {
            id_connection: connection_id,
            id_crm_user: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const users = await this.prisma.crm_users.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_user: cursor,
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
        next_cursor = Buffer.from(users[users.length - 1].id_crm_user).toString(
          'base64',
        );
        users.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedUsers: UnifiedCrmUserOutput[] = await Promise.all(
        users.map(async (user) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: user.id_crm_user,
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
          // Convert the map to an object
const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmUserOutput format
          return {
            id: user.id_crm_user,
            name: user.name,
            email: user.email,
            field_mappings: field_mappings,
            remote_id: user.remote_id,
            created_at: user.created_at,
            modified_at: user.modified_at,
          };
        }),
      );

      let res: UnifiedCrmUserOutput[] = unifiedUsers;

      if (remote_data) {
        const remote_array_data: UnifiedCrmUserOutput[] = await Promise.all(
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
          type: 'crm.user.pulled',
          method: 'GET',
          url: '/crm/users',
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
