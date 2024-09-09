import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalUserOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_users as TicketingUser } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IUserService } from '../types';
import { UnifiedTicketingUserOutput } from '../types/model.unified';

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
    this.registry.registerService('ticketing', 'user', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_users table
  //its role is to fetch all users from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
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
          const providers = TICKETING_PROVIDERS;
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, wh_real_time_trigger } = param;
      const service: IUserService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: user} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingUserOutput,
        OriginalUserOutput,
        IUserService
      >(
        integrationId,
        linkedUserId,
        'ticketing',
        'user',
        service,
        [],
        wh_real_time_trigger,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedTicketingUserOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingUser[]> {
    try {
      const users_results: TicketingUser[] = [];

      const updateOrCreateUser = async (
        user: UnifiedTicketingUserOutput,
        originId: string,
        connection_id: string,
      ) => {
        const existingUser = await this.prisma.tcg_users.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: user.name ?? null,
          email_address: user.email_address ?? null,
          teams: user.teams ?? [],
          modified_at: new Date(),
        };

        if (existingUser) {
          return await this.prisma.tcg_users.update({
            where: {
              id_tcg_user: existingUser.id_tcg_user,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_users.create({
            data: {
              ...baseData,
              id_tcg_user: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        const originId = user.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateUser(user, originId, connection_id);
        const user_id = res.id_tcg_user;
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

  async removeInDb(connection_id: string, remote_id: string) {
    const existingUser = await this.prisma.tcg_users.findFirst({
      where: {
        remote_id: remote_id,
        id_connection: connection_id,
      },
    });
    await this.prisma.tcg_users.delete({
      where: {
        id_tcg_user: existingUser.id_tcg_user,
      },
    });
  }
}
