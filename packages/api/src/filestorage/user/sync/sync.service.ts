import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalUserOutput } from '@@core/utils/types/original/original.file-storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_users as FileStorageUser } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IUserService } from '../types';
import { UnifiedFilestorageUserOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('filestorage', 'user', this);
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

  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, group_id } = data;
      const service: IUserService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFilestorageUserOutput,
        OriginalUserOutput,
        IUserService
      >(integrationId, linkedUserId, 'filestorage', 'user', service, [
        {
          paramName: 'id_group',
          param: group_id,
          shouldPassToIngest: false,
          shouldPassToService: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    users: UnifiedFilestorageUserOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageUser[]> {
    try {
      const users_results: FileStorageUser[] = [];

      const updateOrCreateUser = async (
        user: UnifiedFilestorageUserOutput,
        originId: string,
      ) => {
        const existingUser = await this.prisma.fs_users.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: user.name ?? null,
          email: user.email ?? null,
          is_me: user.is_me ?? false,
          modified_at: new Date(),
        };

        if (existingUser) {
          return await this.prisma.fs_users.update({
            where: {
              id_fs_user: existingUser.id_fs_user,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_users.create({
            data: {
              ...baseData,
              id_fs_user: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const originId = user.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateUser(user, originId);
        const user_id = res.id_fs_user;
        users_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          user.field_mappings,
          user_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(user_id, remote_data[i]);
      }
      return users_results;
    } catch (error) {
      throw error;
    }
  }
}
