import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, CurrencyCode } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingCompanyinfoOutput } from '../types/model.unified';
import { ICompanyInfoService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_company_infos as AccCompanyInfo } from '@prisma/client';
import { OriginalCompanyInfoOutput } from '@@core/utils/types/original/original.accounting';
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
    this.registry.registerService('accounting', 'companyinfo', this);
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
      const service: ICompanyInfoService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingCompanyinfoOutput,
        OriginalCompanyInfoOutput,
        ICompanyInfoService
      >(integrationId, linkedUserId, 'accounting', 'company_info', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    companyInfos: UnifiedAccountingCompanyinfoOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccCompanyInfo[]> {
    try {
      const companyInfoResults: AccCompanyInfo[] = [];

      for (let i = 0; i < companyInfos.length; i++) {
        const companyInfo = companyInfos[i];
        const originId = companyInfo.remote_id;

        let existingCompanyInfo = await this.prisma.acc_company_infos.findFirst(
          {
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          },
        );

        const companyInfoData = {
          name: companyInfo.name,
          legal_name: companyInfo.legal_name,
          tax_number: companyInfo.tax_number,
          fiscal_year_end_month: companyInfo.fiscal_year_end_month,
          fiscal_year_end_day: companyInfo.fiscal_year_end_day,
          currency: companyInfo.currency as CurrencyCode,
          urls: companyInfo.urls,
          tracking_categories: companyInfo.tracking_categories,
          remote_created_at: companyInfo.remote_created_at,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingCompanyInfo) {
          existingCompanyInfo = await this.prisma.acc_company_infos.update({
            where: {
              id_acc_company_info: existingCompanyInfo.id_acc_company_info,
            },
            data: companyInfoData,
          });
        } else {
          existingCompanyInfo = await this.prisma.acc_company_infos.create({
            data: {
              ...companyInfoData,
              id_acc_company_info: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        companyInfoResults.push(existingCompanyInfo);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          companyInfo.field_mappings,
          existingCompanyInfo.id_acc_company_info,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingCompanyInfo.id_acc_company_info,
          remote_data[i],
        );
      }

      return companyInfoResults;
    } catch (error) {
      throw error;
    }
  }
}
