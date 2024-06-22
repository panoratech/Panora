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
    id_fs_user: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedUserOutput format
      const unifiedUser: UnifiedUserOutput = {
        id: user.id_fs_user,
        name: user.name,
        email: user.email,
        is_me: user.is_me,
        field_mappings: field_mappings,
      };

      let res: UnifiedUserOutput = unifiedUser;
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getUsers(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedUserOutput[]> {
    try {
      const users = await this.prisma.fs_users.findMany({
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
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedUserOutput format
          return {
            id: user.id_fs_user,
            name: user.name,
            email: user.email,
            is_me: user.is_me,
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}