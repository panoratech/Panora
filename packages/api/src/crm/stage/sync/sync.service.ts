import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalStageOutput } from '@@core/utils/types/original/original.crm';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CRM_PROVIDERS } from '@panora/shared';
import { crm_deals_stages as CrmStage } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IStageService } from '../types';
import { UnifiedCrmStageOutput } from '../types/model.unified';

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
    this.registry.registerService('crm', 'stage', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our crm_stages table
  //its role is to fetch all stages from providers 3rd parties and save the info inside our db
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
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, deal_id } = data;
      const service: IStageService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:crm, commonObject: stage} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmStageOutput,
        OriginalStageOutput,
        IStageService
      >(integrationId, linkedUserId, 'crm', 'stage', service, [
        {
          param: deal_id,
          paramName: 'deal_id',
          shouldPassToIngest: true,
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
    data: UnifiedCrmStageOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    deal_id: string,
  ): Promise<CrmStage[]> {
    try {
      const stages_results: CrmStage[] = [];

      const updateOrCreateStage = async (
        stage: UnifiedCrmStageOutput,
        originId: string,
      ) => {
        const baseData: any = {
          stage_name: stage.stage_name ?? null,
          modified_at: new Date(),
        };

        if (deal_id) {
          const existingStage = await this.prisma.crm_deals.findFirst({
            where: {
              id_crm_deal: deal_id,
            },
            select: {
              id_crm_deals_stage: true,
            },
          });
          if (existingStage?.id_crm_deals_stage) {
            return await this.prisma.crm_deals_stages.update({
              where: {
                id_crm_deals_stage: existingStage.id_crm_deals_stage,
              },
              data: baseData,
            });
          } else {
            const isExistingStage =
              await this.prisma.crm_deals_stages.findFirst({
                where: {
                  remote_id: originId,
                  id_connection: connection_id,
                },
              });

            if (isExistingStage) {
              await this.prisma.crm_deals.update({
                where: {
                  id_crm_deal: deal_id,
                },
                data: {
                  id_crm_deals_stage: isExistingStage.id_crm_deals_stage,
                },
              });
              return isExistingStage;
            } else {
              const newStage = await this.prisma.crm_deals_stages.create({
                data: {
                  ...baseData,
                  id_crm_deals_stage: uuidv4(),
                  created_at: new Date(),
                  remote_id: originId ?? '',
                  id_connection: connection_id,
                },
              });

              await this.prisma.crm_deals.update({
                where: {
                  id_crm_deal: deal_id,
                },
                data: {
                  id_crm_deals_stage: newStage.id_crm_deals_stage,
                },
              });

              return newStage;
            }
          }
        } else {
          let existingStage;
          if (!originId) {
            existingStage = await this.prisma.crm_deals_stages.findFirst({
              where: {
                stage_name: stage.stage_name,
                id_connection: connection_id,
              },
            });
          } else {
            existingStage = await this.prisma.crm_deals_stages.findFirst({
              where: {
                remote_id: originId,
                id_connection: connection_id,
              },
            });
          }

          if (existingStage) {
            return await this.prisma.crm_deals_stages.update({
              where: {
                id_crm_deals_stage: existingStage.id_crm_deals_stage,
              },
              data: baseData,
            });
          } else {
            return await this.prisma.crm_deals_stages.create({
              data: {
                ...baseData,
                id_crm_deals_stage: uuidv4(),
                created_at: new Date(),
                remote_id: originId ?? null,
                id_connection: connection_id,
              },
            });
          }
        }
      };

      for (let i = 0; i < data.length; i++) {
        const stage = data[i];
        const originId = stage.remote_id;

        const res = await updateOrCreateStage(stage, originId);
        const stage_id = res.id_crm_deals_stage;
        stages_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          stage.field_mappings,
          stage_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(stage_id, remote_data[i]);
      }
      return stages_results;
    } catch (error) {
      throw error;
    }
  }
}
