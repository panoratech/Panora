import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedUserOutput } from '../types/model.unified';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async getUser(
    id_ats_user: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedUserOutput format
      const unifiedUser: UnifiedUserOutput = {
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

      let res: UnifiedUserOutput = unifiedUser;
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
  ): Promise<UnifiedUserOutput[]> {
    try {
      const users = await this.prisma.ats_users.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unifiedUsers: UnifiedUserOutput[] = await Promise.all(
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
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedUserOutput format
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
