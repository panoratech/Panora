import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { CrmObject } from '@crm/@lib/@types';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedOpportunityOutput } from '../types/model.unified';
import { IOpportunityService } from '../types';
import { crm_opportunities as CrmOpportunity } from '@prisma/client';
import { OriginalOpportunityOutput } from '@@core/utils/types/original/original.crm';
import { CRM_PROVIDERS } from '@panora/shared';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
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
    this.registry.registerService('crm', 'opportunity', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('crm-sync-opportunities', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  // Function used by sync worker which populates our crm_opportunities table
  // Its role is to fetch all opportunities from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log(`Syncing opportunities....`);
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
                const providers = CRM_PROVIDERS.filter(
                  (provider) => provider !== 'zoho',
                );
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

  // Todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IOpportunityService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedOpportunityOutput,
        OriginalOpportunityOutput,
        IOpportunityService
      >(integrationId, linkedUserId, 'crm', 'opportunity', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedOpportunityOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmOpportunity[]> {
    try {
      const opportunities_results: CrmOpportunity[] = [];

      const updateOrCreateOpportunity = async (
        opportunity: UnifiedOpportunityOutput,
        originId: string,
      ) => {
        const existingOpportunity = await this.prisma.crm_opportunities.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          title: opportunity.title ?? null,
          description: opportunity.description ?? null,
          amount: opportunity.amount ?? null,
          id_crm_contact: opportunity.contact_id ?? null,
          id_crm_company: opportunity.company_id ?? null,
          id_crm_deal: opportunity.deal_id ?? null,
          id_crm_user: opportunity.user_id ?? null,
          modified_at: new Date(),
        };

        if (existingOpportunity) {
          return await this.prisma.crm_opportunities.update({
            where: {
              id_crm_opportunity: existingOpportunity.id_crm_opportunity,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.crm_opportunities.create({
            data: {
              ...baseData,
              id_crm_opportunity: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const opportunity = data[i];
        const originId = opportunity.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateOpportunity(opportunity, originId);
        const opportunity_id = res.id_crm_opportunity;
        opportunities_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          opportunity.field_mappings,
          opportunity_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(opportunity_id, remote_data[i]);
      }
      return opportunities_results;
    } catch (error) {
      throw error;
    }
  }
}
