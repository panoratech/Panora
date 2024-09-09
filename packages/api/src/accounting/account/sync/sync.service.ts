import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingAccountOutput } from '../types/model.unified';
import { IAccountService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_accounts as AccAccount } from '@prisma/client';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.accounting';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('accounting', 'account', this);
  }
  onModuleInit() {
    console.log('');
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
          const providers = ACCOUNTING_PROVIDERS;
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
      const service: IAccountService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingAccountOutput,
        OriginalAccountOutput,
        IAccountService
      >(integrationId, linkedUserId, 'accounting', 'account', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    accounts: UnifiedAccountingAccountOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccAccount[]> {
    try {
      const accountResults: AccAccount[] = [];

      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const originId = account.remote_id;

        let existingAccount = await this.prisma.acc_accounts.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const accountData = {
          name: account.name,
          description: account.description,
          classification: account.classification,
          type: account.type,
          status: account.status,
          current_balance: account.current_balance
            ? Number(account.current_balance)
            : null,
          currency: account.currency as CurrencyCode,
          account_number: account.account_number,
          parent_account: account.parent_account,
          id_acc_company_info: account.company_info_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingAccount) {
          existingAccount = await this.prisma.acc_accounts.update({
            where: { id_acc_account: existingAccount.id_acc_account },
            data: accountData,
          });
        } else {
          existingAccount = await this.prisma.acc_accounts.create({
            data: {
              ...accountData,
              id_acc_account: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        accountResults.push(existingAccount);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          account.field_mappings,
          existingAccount.id_acc_account,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingAccount.id_acc_account,
          remote_data[i],
        );
      }

      return accountResults;
    } catch (error) {
      throw error;
    }
  }
}
