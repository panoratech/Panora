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
import { IUserService } from '../types';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedAtsUserOutput } from '../types/model.unified';
import { ats_users as AtsUser } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

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
    this.registry.registerService('ats', 'user', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('ats-sync-users', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing users...');
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
                const providers = ATS_PROVIDERS;
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
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IUserService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(`No service found in {vertical:ats, commonObject: user} for integration ID: ${integrationId}`);
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsUserOutput,
        OriginalUserOutput,
        IUserService
      >(integrationId, linkedUserId, 'ats', 'user', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    users: UnifiedAtsUserOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsUser[]> {
    try {
      const users_results: AtsUser[] = [];

      const updateOrCreateUser = async (
        user: UnifiedAtsUserOutput,
        originId: string,
      ) => {
        const existingUser = await this.prisma.ats_users.findFirst({
          where: {
            remote_id: originId,
            
          },
        });

        const baseData: any = {
          first_name: user.first_name ?? null,
          last_name: user.last_name ?? null,
          email: user.email ?? null,
          disabled: user.disabled ?? null,
          access_role: user.access_role ?? null,
          remote_created_at: user.remote_created_at ?? null,
          remote_modified_at: user.remote_modified_at ?? null,
          modified_at: new Date(),
        };

        if (existingUser) {
          return await this.prisma.ats_users.update({
            where: {
              id_ats_user: existingUser.id_ats_user,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_users.create({
            data: {
              ...baseData,
              id_ats_user: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              
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
        const user_id = res.id_ats_user;
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
