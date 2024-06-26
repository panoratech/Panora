import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from '../types/model.unified';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ServiceRegistry } from './registry.service';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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

  async addPermission(
    unifiedPermissionData: UnifiedPermissionInput,
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.permission',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedPermissionInput>({
          sourceObject: unifiedPermissionData,
          targetType: FileStorageObject.permission,
          providerName: integrationId,
          vertical: 'filestorage',
          customFieldMappings: unifiedPermissionData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified object is ' + JSON.stringify(desunifiedObject),
      );

      const service = this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalPermissionOutput> =
        await service.addPermission(desunifiedObject, linkedUserId);

      const unifiedObject = (await this.coreUnification.unify<
        OriginalPermissionOutput[]
      >({
        sourceObject: [resp.data],
        targetType: FileStorageObject.permission,
        providerName: integrationId,
        vertical: 'filestorage',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedPermissionOutput[];

      const source_permission = resp.data;
      const target_permission = unifiedObject[0];

      const existingPermission = await this.prisma.fs_permissions.findFirst({
        where: {
          remote_id: target_permission.remote_id,
          id_connection: connection_id,
        },
      });

      let unique_fs_permission_id: string;

      if (existingPermission) {
        const data: any = {
          user: target_permission.user_id,
          group: target_permission.group_id,
          type: target_permission.type,
          roles: target_permission.roles,
          modified_at: new Date(),
        };

        const res = await this.prisma.fs_permissions.update({
          where: {
            id_fs_permission: existingPermission.id_fs_permission,
          },
          data: data,
        });

        unique_fs_permission_id = res.id_fs_permission;
      } else {
        const data: any = {
          id_fs_permission: uuidv4(),
          user: target_permission.user_id,
          group: target_permission.group_id,
          type: target_permission.type,
          roles: target_permission.roles,
          created_at: new Date(),
          modified_at: new Date(),
          remote_id: target_permission.remote_id,
          id_connection: connection_id,
        };

        const newPermission = await this.prisma.fs_permissions.create({
          data: data,
        });

        unique_fs_permission_id = newPermission.id_fs_permission;
      }

      if (
        target_permission.field_mappings &&
        target_permission.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_fs_permission_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_permission.field_mappings,
        )) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: slug,
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: value || 'null',
                attribute: {
                  connect: {
                    id_attribute: attribute.id_attribute,
                  },
                },
                entity: {
                  connect: {
                    id_entity: entity.id_entity,
                  },
                },
              },
            });
          }
        }
      }

      await this.prisma.remote_data.upsert({
        where: {
          ressource_owner_id: unique_fs_permission_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_fs_permission_id,
          format: 'json',
          data: JSON.stringify(source_permission),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_permission),
          created_at: new Date(),
        },
      });

      const result_permission = await this.getPermission(
        unique_fs_permission_id,
        undefined,
        undefined,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'filestorage.permission.created',
          method: 'POST',
          url: '/filestorage/permissions',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_permission,
        'filestorage.permission.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_permission;
    } catch (error) {
      throw error;
    }
  }

  async getPermission(
    id_fs_permission: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedPermissionOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedPermissionOutput format
      const unifiedPermission: UnifiedPermissionOutput = {
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

      let res: UnifiedPermissionOutput = unifiedPermission;
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
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedPermissionOutput[];
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

      const unifiedPermissions: UnifiedPermissionOutput[] = await Promise.all(
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

          // Transform to UnifiedPermissionOutput format
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

      let res: UnifiedPermissionOutput[] = unifiedPermissions;

      if (remote_data) {
        const remote_array_data: UnifiedPermissionOutput[] = await Promise.all(
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

  async updatePermission(
    id: string,
    updatePermissionData: Partial<UnifiedPermissionInput>,
  ): Promise<UnifiedPermissionOutput> {
    try {
    } catch (error) {}
    return;
  }
}
