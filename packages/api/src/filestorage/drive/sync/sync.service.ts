import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_drives as FileStorageDrive } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IDriveService } from '../types';
import { UnifiedFilestorageDriveOutput } from '../types/model.unified';
@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('filestorage', 'drive', this);
  }
  onModuleInit() {
    //
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
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
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IDriveService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFilestorageDriveOutput,
        OriginalDriveOutput,
        IDriveService
      >(integrationId, linkedUserId, 'filestorage', 'drive', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    drives: UnifiedFilestorageDriveOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageDrive[]> {
    try {
      const drives_results: FileStorageDrive[] = [];

      const updateOrCreateDrive = async (
        drive: UnifiedFilestorageDriveOutput,
        originId: string,
      ) => {
        const existingDrive = await this.prisma.fs_drives.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: drive.name ?? null,
          remote_created_at: drive.remote_created_at ?? null,
          drive_url: drive.drive_url ?? null,
          modified_at: new Date(),
        };

        if (existingDrive) {
          return await this.prisma.fs_drives.update({
            where: {
              id_fs_drive: existingDrive.id_fs_drive,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_drives.create({
            data: {
              ...baseData,
              id_fs_drive: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < drives.length; i++) {
        const drive = drives[i];
        const originId = drive.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateDrive(drive, originId);
        const drive_id = res.id_fs_drive;
        drives_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          drive.field_mappings,
          drive_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(drive_id, remote_data[i]);
      }
      return drives_results;
    } catch (error) {
      throw error;
    }
  }
}
