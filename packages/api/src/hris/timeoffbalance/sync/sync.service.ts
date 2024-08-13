import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedHrisTimeoffbalanceOutput } from '../types/model.unified';
import { ITimeoffBalanceService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_time_off_balances as HrisTimeOffBalance } from '@prisma/client';
import { OriginalTimeoffBalanceOutput } from '@@core/utils/types/original/original.hris';
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
    this.registry.registerService('hris', 'timeoffbalance', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */12 * * *') // every 12 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing time off balances...');
      const users = user_id
        ? [await this.prisma.users.findUnique({ where: { id_user: user_id } })]
        : await this.prisma.users.findMany();

      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: { id_user: user.id_user },
          });
          for (const project of projects) {
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: { id_project: project.id_project },
            });
            for (const linkedUser of linkedUsers) {
              for (const provider of HRIS_PROVIDERS) {
                await this.syncForLinkedUser({
                  integrationId: provider,
                  linkedUserId: linkedUser.id_linked_user,
                });
              }
            }
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
      const service: ITimeoffBalanceService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisTimeoffbalanceOutput,
        OriginalTimeoffBalanceOutput,
        ITimeoffBalanceService
      >(integrationId, linkedUserId, 'hris', 'timeoffbalance', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    timeOffBalances: UnifiedHrisTimeoffbalanceOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisTimeOffBalance[]> {
    try {
      const timeOffBalanceResults: HrisTimeOffBalance[] = [];

      for (let i = 0; i < timeOffBalances.length; i++) {
        const timeOffBalance = timeOffBalances[i];
        const originId = timeOffBalance.remote_id;

        let existingTimeOffBalance =
          await this.prisma.hris_time_off_balances.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });

        const timeOffBalanceData = {
          balance: timeOffBalance.balance
            ? BigInt(timeOffBalance.balance)
            : null,
          id_hris_employee: timeOffBalance.employee_id,
          used: timeOffBalance.used ? BigInt(timeOffBalance.used) : null,
          policy_type: timeOffBalance.policy_type,
          remote_id: originId,
          remote_created_at: timeOffBalance.remote_created_at
            ? new Date(timeOffBalance.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: timeOffBalance.remote_was_deleted || false,
        };

        if (existingTimeOffBalance) {
          existingTimeOffBalance =
            await this.prisma.hris_time_off_balances.update({
              where: {
                id_hris_time_off_balance:
                  existingTimeOffBalance.id_hris_time_off_balance,
              },
              data: timeOffBalanceData,
            });
        } else {
          existingTimeOffBalance =
            await this.prisma.hris_time_off_balances.create({
              data: {
                ...timeOffBalanceData,
                id_hris_time_off_balance: uuidv4(),
                created_at: new Date(),
                id_connection: connection_id,
              },
            });
        }

        timeOffBalanceResults.push(existingTimeOffBalance);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          timeOffBalance.field_mappings,
          existingTimeOffBalance.id_hris_time_off_balance,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingTimeOffBalance.id_hris_time_off_balance,
          remote_data[i],
        );
      }

      return timeOffBalanceResults;
    } catch (error) {
      throw error;
    }
  }
}
