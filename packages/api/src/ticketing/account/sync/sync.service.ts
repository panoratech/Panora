import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_accounts as TicketingAccount } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IAccountService } from '../types';
import { UnifiedTicketingAccountOutput } from '../types/model.unified';

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
    this.registry.registerService('ticketing', 'account', this);
  }
  onModuleInit() {
    //
  }

  //function used by sync worker which populate our tcg_accounts table
  //its role is to fetch all accounts from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
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
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, wh_real_time_trigger } = data;
      const service: IAccountService =
        this.serviceRegistry.getService(integrationId);

      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: account} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingAccountOutput,
        OriginalAccountOutput,
        IAccountService
      >(
        integrationId,
        linkedUserId,
        'ticketing',
        'account',
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
    data: UnifiedTicketingAccountOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingAccount[]> {
    try {
      const accounts_results: TicketingAccount[] = [];

      const updateOrCreateAccount = async (
        account: UnifiedTicketingAccountOutput,
        originId: string,
        connection_id: string,
      ) => {
        const existingAccount = await this.prisma.tcg_accounts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        if (existingAccount) {
          return await this.prisma.tcg_accounts.update({
            where: { id_tcg_account: existingAccount.id_tcg_account },
            data: {
              name: existingAccount.name ?? null,
              domains: existingAccount.domains ?? [],
              modified_at: new Date(),
            },
          });
        } else {
          return await this.prisma.tcg_accounts.create({
            data: {
              id_tcg_account: uuidv4(),
              name: account.name ?? null,
              domains: account.domains ?? null,
              created_at: new Date(),
              modified_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const account = data[i];
        const originId = account.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateAccount(
          account,
          originId,
          connection_id,
        );
        const account_id = res.id_tcg_account;
        accounts_results.push(res);

        await this.ingestService.processFieldMappings(
          account.field_mappings,
          account_id,
          originSource,
          linkedUserId,
        );
        await this.ingestService.processRemoteData(account_id, remote_data[i]);
      }
      return accounts_results;
    } catch (error) {
      throw error;
    }
  }

  async removeInDb(connection_id: string, remote_id: string) {
    const existingAccount = await this.prisma.tcg_accounts.findFirst({
      where: {
        remote_id: remote_id,
        id_connection: connection_id,
      },
    });
    await this.prisma.tcg_accounts.delete({
      where: {
        id_tcg_account: existingAccount.id_tcg_account,
      },
    });
  }
}
