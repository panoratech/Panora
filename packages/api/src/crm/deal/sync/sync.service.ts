import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedDealOutput } from '../types/model.unified';
import { IDealService } from '../types';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { crm_deals as CrmDeal } from '@prisma/client';
import { CRM_PROVIDERS } from '@panora/shared';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('crm-sync-deals', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our crm_deals table
  //its role is to fetch all deals from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncDeals(user_id?: string) {
    try {
      this.logger.log(`Syncing deals....`);
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
                    await this.syncDealsForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                    );
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

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncDealsForLinkedUser(integrationId: string, linkedUserId: string) {
    try {
      this.logger.log(
        `Syncing ${integrationId} deals for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'crm',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping deals syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.deal',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IDealService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalDealOutput[]> = await service.syncDeals(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalDealOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedDealOutput,
        OriginalDealOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'crm',
        'deal',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedDealOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmDeal[]> {
    try {
      let deals_results: CrmDeal[] = [];
      for (let i = 0; i < data.length; i++) {
        const deal = data[i];
        const originId = deal.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingDeal = await this.prisma.crm_deals.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_crm_deal_id: string;

        if (existingDeal) {
          // Update the existing deal
          let data: any = {
            modified_at: new Date(),
            description: '',
            amount: deal.amount,
          };
          if (deal.name) {
            data = { ...data, name: deal.name };
          }
          if (deal.description) {
            data = { ...data, description: deal.description };
          }
          if (deal.amount) {
            data = { ...data, amount: deal.amount };
          }
          if (deal.user_id) {
            data = { ...data, id_crm_user: deal.user_id };
          }
          if (deal.stage_id) {
            data = { ...data, id_crm_deals_stage: deal.stage_id };
          }
          if (deal.company_id) {
            data = { ...data, id_crm_company: deal.company_id };
          }

          const res = await this.prisma.crm_deals.update({
            where: {
              id_crm_deal: existingDeal.id_crm_deal,
            },
            data: data,
          });
          unique_crm_deal_id = res.id_crm_deal;
          deals_results = [...deals_results, res];
        } else {
          // Create a new deal
          this.logger.log('deal not exists');
          let data: any = {
            id_crm_deal: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            description: '',
            remote_id: originId,
            id_connection: connection_id,
          };

          this.logger.log('deal name is ' + deal.name);

          if (deal.name) {
            data = { ...data, name: deal.name };
          }
          if (deal.description) {
            data = { ...data, description: deal.description };
          }
          if (deal.amount) {
            data = { ...data, amount: deal.amount };
          }
          if (deal.user_id) {
            data = { ...data, id_crm_user: deal.user_id };
          }
          if (deal.stage_id) {
            data = { ...data, id_crm_deals_stage: deal.stage_id };
          }
          if (deal.company_id) {
            data = { ...data, id_crm_company: deal.company_id };
          }
          const res = await this.prisma.crm_deals.create({
            data: data,
          });
          unique_crm_deal_id = res.id_crm_deal;
          deals_results = [...deals_results, res];
        }

        // check duplicate or existing values
        if (deal.field_mappings && deal.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_deal_id,
            },
          });

          for (const [slug, value] of Object.entries(deal.field_mappings)) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: value || 'null',
                  attribute: {
                    connect: {
                      id_attribute: attribute.id_attribute,
                    },
                  },
                  entity: {
                    connect: {
                      id_entity: entity.id_entity,
                    },
                  },
                },
              });
            }
          }
        }

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_crm_deal_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_deal_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return deals_results;
    } catch (error) {
      throw error;
    }
  }
}
