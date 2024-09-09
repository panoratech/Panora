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
import { IGroupService } from '../types';
import { UnifiedFilestorageGroupOutput } from '../types/model.unified';
import { fs_groups as FileStorageGroup } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.file-storage';
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
    this.registry.registerService('filestorage', 'group', this);
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
      const service: IGroupService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFilestorageGroupOutput,
        OriginalGroupOutput,
        IGroupService
      >(integrationId, linkedUserId, 'filestorage', 'group', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    groups: UnifiedFilestorageGroupOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageGroup[]> {
    try {
      const groups_results: FileStorageGroup[] = [];

      const updateOrCreateGroup = async (
        group: UnifiedFilestorageGroupOutput,
        originId: string,
      ) => {
        const existingGroup = await this.prisma.fs_groups.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: group.name ?? null,
          users: group.users ?? null,
          remote_was_deleted: group.remote_was_deleted ?? null,
          modified_at: new Date(),
        };

        if (existingGroup) {
          return await this.prisma.fs_groups.update({
            where: {
              id_fs_group: existingGroup.id_fs_group,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_groups.create({
            data: {
              ...baseData,
              id_fs_group: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const originId = group.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateGroup(group, originId);
        const group_id = res.id_fs_group;
        groups_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          group.field_mappings,
          group_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(group_id, remote_data[i]);
      }
      return groups_results;
    } catch (error) {
      throw error;
    }
  }
}
