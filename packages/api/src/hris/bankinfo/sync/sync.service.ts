import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { UnifiedHrisBankinfoOutput } from '../types/model.unified';
import { HRIS_PROVIDERS } from '@panora/shared';
import { hris_bank_infos as HrisBankInfo } from '@prisma/client';
import { OriginalBankInfoOutput } from '@@core/utils/types/original/original.hris';
import { IBankInfoService } from '../types';
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
    this.registry.registerService('hris', 'bankinfo', this);
  }

  async onModuleInit() {
    // Initialization logic if needed
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing bank infos...');
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
      const service: IBankInfoService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedHrisBankinfoOutput,
        OriginalBankInfoOutput,
        IBankInfoService
      >(integrationId, linkedUserId, 'hris', 'bankinfo', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    bankInfos: UnifiedHrisBankinfoOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<HrisBankInfo[]> {
    try {
      const bankInfoResults: HrisBankInfo[] = [];

      for (let i = 0; i < bankInfos.length; i++) {
        const bankInfo = bankInfos[i];
        const originId = bankInfo.remote_id;

        let existingBankInfo = await this.prisma.hris_bank_infos.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const bankInfoData = {
          account_type: bankInfo.account_type,
          bank_name: bankInfo.bank_name,
          account_number: bankInfo.account_number,
          routing_number: bankInfo.routing_number,
          id_hris_employee: bankInfo.employee_id,
          remote_id: originId,
          remote_created_at: bankInfo.remote_created_at
            ? new Date(bankInfo.remote_created_at)
            : null,
          modified_at: new Date(),
          remote_was_deleted: bankInfo.remote_was_deleted,
        };

        if (existingBankInfo) {
          existingBankInfo = await this.prisma.hris_bank_infos.update({
            where: { id_hris_bank_info: existingBankInfo.id_hris_bank_info },
            data: bankInfoData,
          });
        } else {
          existingBankInfo = await this.prisma.hris_bank_infos.create({
            data: {
              ...bankInfoData,
              id_hris_bank_info: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        bankInfoResults.push(existingBankInfo);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          bankInfo.field_mappings,
          existingBankInfo.id_hris_bank_info,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingBankInfo.id_hris_bank_info,
          remote_data[i],
        );
      }

      return bankInfoResults;
    } catch (error) {
      throw error;
    }
  }
}
