import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CRM_PROVIDERS } from '@panora/shared';
import { crm_deals as CrmDeal } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IDealService } from '../types';
import { UnifiedCrmDealOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('crm', 'deal', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our crm_deals table
  //its role is to fetch all deals from providers 3rd parties and save the info inside our db
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
          const providers = CRM_PROVIDERS;
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
      const { integrationId, linkedUserId } = param;
      const service: IDealService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:crm, commonObject: deal} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmDealOutput,
        OriginalDealOutput,
        IDealService
      >(integrationId, linkedUserId, 'crm', 'deal', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCrmDealOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmDeal[]> {
    try {
      const deals_results: CrmDeal[] = [];

      const updateOrCreateDeal = async (
        deal: UnifiedCrmDealOutput,
        originId: string,
      ) => {
        const existingDeal = await this.prisma.crm_deals.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: deal.name ?? null,
          description: deal.description ?? null,
          amount: deal.amount ?? 0,
          id_crm_user: deal.user_id ?? null,
          id_crm_deals_stage: deal.stage_id ?? null,
          id_crm_company: deal.company_id ?? null,
          modified_at: new Date(),
        };

        if (existingDeal) {
          return await this.prisma.crm_deals.update({
            where: {
              id_crm_deal: existingDeal.id_crm_deal,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.crm_deals.create({
            data: {
              ...baseData,
              id_crm_deal: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const deal = data[i];
        const originId = deal.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateDeal(deal, originId);
        const deal_id = res.id_crm_deal;
        deals_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          deal.field_mappings,
          deal_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(deal_id, remote_data[i]);
      }
      return deals_results;
    } catch (error) {
      throw error;
    }
  }
}
