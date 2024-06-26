import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IDriveService } from '../types';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedDriveOutput } from '../types/model.unified';
import { fs_drives as FileStorageDrive } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('filestorage', 'drive', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-drives',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncDrives(user_id?: string) {
    try {
      this.logger.log('Syncing drives...');
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
                    await this.syncDrivesForLinkedUser(
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

  async syncDrivesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} drives for linkedUser ${linkedUserId}`,
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
          `Skipping drives syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.drive',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IDriveService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalDriveOutput[]> = await service.syncDrives(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalDriveOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalDriveOutput[]
      >({
        sourceObject,
        targetType: FileStorageObject.drive,
        providerName: integrationId,
        vertical: 'filestorage',
        connectionId: connection.id_connection,
        customFieldMappings,
      })) as UnifiedDriveOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const drives_data = await this.saveDrivesInDb(
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
          type: 'filestorage.drive.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        drives_data,
        'filestorage.drive.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveDrivesInDb(
    connection_id: string,
    linkedUserId: string,
    drives: UnifiedDriveOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageDrive[]> {
    try {
      let drives_results: FileStorageDrive[] = [];
      for (let i = 0; i < drives.length; i++) {
        const drive = drives[i];
        const originId = drive.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingDrive = await this.prisma.fs_drives.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_fs_drive_id: string;

        if (existingDrive) {
          // Update the existing drive
          let data: any = {
            modified_at: new Date(),
          };
          if (drive.name) {
            data = { ...data, name: drive.name };
          }
          if (drive.remote_created_at) {
            data = { ...data, remote_created_at: drive.remote_created_at };
          }
          if (drive.drive_url) {
            data = { ...data, drive_url: drive.drive_url };
          }
          const res = await this.prisma.fs_drives.update({
            where: {
              id_fs_drive: existingDrive.id_fs_drive,
            },
            data: data,
          });
          unique_fs_drive_id = res.id_fs_drive;
          drives_results = [...drives_results, res];
        } else {
          // Create a new drive
          this.logger.log('Drive does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_drive: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (drive.name) {
            data = { ...data, name: drive.name };
          }
          if (drive.remote_created_at) {
            data = { ...data, remote_created_at: drive.remote_created_at };
          }
          if (drive.drive_url) {
            data = { ...data, drive_url: drive.drive_url };
          }

          const newDrive = await this.prisma.fs_drives.create({
            data: data,
          });

          unique_fs_drive_id = newDrive.id_fs_drive;
          drives_results = [...drives_results, newDrive];
        }

        // check duplicate or existing values
        if (drive.field_mappings && drive.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_drive_id,
            },
          });

          for (const [slug, value] of Object.entries(drive.field_mappings)) {
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
            ressource_owner_id: unique_fs_drive_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_drive_id,
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
      return drives_results;
    } catch (error) {
      throw error;
    }
  }
}
