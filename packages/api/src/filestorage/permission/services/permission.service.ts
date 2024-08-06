import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PermissionRole,
  PermissionType,
  UnifiedFilestoragePermissionInput,
  UnifiedFilestoragePermissionOutput,
} from '../types/model.unified';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class PermissionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(PermissionService.name);
  }

  async getPermission(
    id_fs_permission: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestoragePermissionOutput> {
    try {
      const permission = await this.prisma.fs_permissions.findUnique({
        where: {
          id_fs_permission: id_fs_permission,
        },
      });

      // Fetch field mappings for the permission
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: permission.id_fs_permission,
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

      // Transform to UnifiedFilestoragePermissionOutput format
      const unifiedPermission: UnifiedFilestoragePermissionOutput = {
        id: permission.id_fs_permission,
        user_id: permission.user,
        group_id: permission.group,
        type: permission.type,
        roles: permission.roles,
        field_mappings: field_mappings,
        remote_id: permission.remote_id,
        created_at: permission.created_at,
        modified_at: permission.modified_at,
      };

      let res: UnifiedFilestoragePermissionOutput = unifiedPermission;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: permission.id_fs_permission,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'filestorage.permission.pull',
            method: 'GET',
            url: '/filestorage/permission',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getPermissions(
    connectionId: string,
    projectId: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestoragePermissionOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_permissions.findFirst({
          where: {
            id_connection: connectionId,
            id_fs_permission: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const permissions = await this.prisma.fs_permissions.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_fs_permission: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connectionId,
        },
      });

      if (permissions.length === limit + 1) {
        next_cursor = Buffer.from(
          permissions[permissions.length - 1].id_fs_permission,
        ).toString('base64');
        permissions.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedPermissions: UnifiedFilestoragePermissionOutput[] =
        await Promise.all(
          permissions.map(async (permission) => {
            // Fetch field mappings for the permission
            const values = await this.prisma.value.findMany({
              where: {
                entity: {
                  ressource_owner_id: permission.id_fs_permission,
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

            // Transform to UnifiedFilestoragePermissionOutput format
            return {
              id: permission.id_fs_permission,
              user_id: permission.user,
              group_id: permission.group,
              type: permission.type,
              roles: permission.roles,
              field_mappings: field_mappings,
              remote_id: permission.remote_id,
              created_at: permission.created_at,
              modified_at: permission.modified_at,
            };
          }),
        );

      let res: UnifiedFilestoragePermissionOutput[] = unifiedPermissions;

      if (remote_data) {
        const remote_array_data: UnifiedFilestoragePermissionOutput[] =
          await Promise.all(
            res.map(async (permission) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: permission.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...permission, remote_data };
            }),
          );

        res = remote_array_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.permission.pull',
          method: 'GET',
          url: '/filestorage/permissions',
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
