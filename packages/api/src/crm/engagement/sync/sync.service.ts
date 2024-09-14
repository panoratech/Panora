import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { ENGAGEMENTS_TYPE } from '@crm/@lib/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CRM_PROVIDERS } from '@panora/shared';
import { crm_engagements as CrmEngagement } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IEngagementService } from '../types';
import { UnifiedCrmEngagementOutput } from '../types/model.unified';

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
    this.registry.registerService('crm', 'engagement', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our crm_engagements table
  //its role is to fetch all engagements from providers 3rd parties and save the info inside our db
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
  // todo engagement type
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, engagement_type } = data;
      const service: IEngagementService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:crm, commonObject: engagement} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedCrmEngagementOutput,
        OriginalEngagementOutput,
        IEngagementService
      >(integrationId, linkedUserId, 'crm', 'engagement', service, [
        {
          param: engagement_type,
          paramName: 'engagement_type',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedCrmEngagementOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmEngagement[]> {
    try {
      const engagements_results: CrmEngagement[] = [];

      const updateOrCreateEngagement = async (
        engagement: UnifiedCrmEngagementOutput,
        originId: string,
      ) => {
        let existingEngagement;
        if (!originId) {
          existingEngagement = await this.prisma.crm_engagements.findFirst({
            where: {
              content: engagement.content,
              id_connection: connection_id,
            },
          });
        } else {
          existingEngagement = await this.prisma.crm_engagements.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          content: engagement.content ?? null,
          direction: engagement.direction ?? null,
          subject: engagement.subject ?? null,
          start_at: engagement.start_at ?? null,
          end_time: engagement.end_time ?? null,
          type: engagement.type ?? null,
          modified_at: new Date(),
        };

        if (engagement.contacts) {
          baseData.contacts = engagement.contacts;
        }
        if (engagement.company_id) {
          baseData.id_crm_company = engagement.company_id;
        }
        if (engagement.user_id) {
          baseData.id_crm_user = engagement.user_id;
        }
        if (existingEngagement) {
          return await this.prisma.crm_engagements.update({
            where: {
              id_crm_engagement: existingEngagement.id_crm_engagement,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.crm_engagements.create({
            data: {
              ...baseData,
              id_crm_engagement: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const engagement = data[i];
        const originId = engagement.remote_id;

        const res = await updateOrCreateEngagement(engagement, originId);
        const engagement_id = res.id_crm_engagement;
        engagements_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          engagement.field_mappings,
          engagement_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          engagement_id,
          remote_data[i],
        );
      }
      return engagements_results;
    } catch (error) {
      throw error;
    }
  }
}
