import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CoreUnification } from '@@core/utils/services/core.service';
import { ApiResponse } from '@@core/utils/types';
import { IPermissionService } from '../types';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedPermissionOutput } from '../types/model.unified';
import { fs_permissions as FileStoragePermission } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'filestorage-sync-permissions';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncPermissions(user_id?: string) {
    try {
      this.logger.log('Syncing permissions...');
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = FILESTORAGE_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncPermissionsForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                      id_project,
                    );
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncPermissionsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} permissions for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'filestorage',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping permissions syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.permission',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IPermissionService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalPermissionOutput[]> =
        await service.syncPermissions(linkedUserId, remoteProperties);

      const sourceObject: OriginalPermissionOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalPermissionOutput[]
      >({
        sourceObject,
        targetType: FileStorageObject.permission,
        providerName: integrationId,
        vertical: 'filestorage',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedPermissionOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const permissions_data = await this.savePermissionsInDb(
        connection.id_connection,
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.permission.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        permissions_data,
        'filestorage.permission.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async savePermissionsInDb(
    connection_id: string,
    linkedUserId: string,
    permissions: UnifiedPermissionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStoragePermission[]> {
    try {
      let permissions_results: FileStoragePermission[] = [];
      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const originId = permission.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingPermission = await this.prisma.fs_permissions.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_fs_permission_id: string;

        if (existingPermission) {
          // Update the existing permission
          let data: any = {
            modified_at: new Date(),
          };
          if (permission.roles) {
            data = { ...data, roles: permission.roles };
          }
          if (permission.type) {
            data = { ...data, type: permission.type };
          }
          if (permission.user_id) {
            data = { ...data, user_id: permission.user_id };
          }
          if (permission.group_id) {
            data = { ...data, group_id: permission.group_id };
          }
          const res = await this.prisma.fs_permissions.update({
            where: {
              id_fs_permission: existingPermission.id_fs_permission,
            },
            data: data,
          });
          unique_fs_permission_id = res.id_fs_permission;
          permissions_results = [...permissions_results, res];
        } else {
          // Create a new permission
          this.logger.log('Permission does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_permission: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (permission.roles) {
            data = { ...data, roles: permission.roles };
          }
          if (permission.type) {
            data = { ...data, type: permission.type };
          }
          if (permission.user_id) {
            data = { ...data, user_id: permission.user_id };
          }
          if (permission.group_id) {
            data = { ...data, group_id: permission.group_id };
          }

          const newPermission = await this.prisma.fs_permissions.create({
            data: data,
          });

          unique_fs_permission_id = newPermission.id_fs_permission;
          permissions_results = [...permissions_results, newPermission];
        }

        // check duplicate or existing values
        if (permission.field_mappings && permission.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_permission_id,
            },
          });

          for (const [slug, value] of Object.entries(
            permission.field_mappings,
          )) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
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

        // insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_fs_permission_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_permission_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return permissions_results;
    } catch (error) {
      throw error;
    }
  }
}
