import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { CrmObject } from '@crm/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedDealOutput } from '../types/model.unified';
import { IDealService } from '../types';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { crm_deals as CrmDeal } from '@prisma/client';
import { CRM_PROVIDERS } from '@panora/shared';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.syncDeals();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_deals table
  //its role is to fetch all deals from providers 3rd parties and save the info inside our db
  async syncDeals() {
    try {
      this.logger.log(`Syncing deals....`);
      const defaultOrg = await this.prisma.organizations.findFirst({
        where: {
          name: 'Acme Inc',
        },
      });

      const defaultProject = await this.prisma.projects.findFirst({
        where: {
          id_organization: defaultOrg.id_organization,
          name: 'Project 1',
        },
      });
      const id_project = defaultProject.id_project;
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = CRM_PROVIDERS.filter(
            (provider) => provider !== 'zoho' && provider !== 'freshsales',
          );
          for (const provider of providers) {
            try {
              await this.syncDealsForLinkedUser(
                provider,
                linkedUser.id_linked_user,
                id_project,
              );
            } catch (error) {
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncDealsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} deals for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping deals syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
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
      const resp: ApiResponse<OriginalDealOutput[]> = await service.syncDeals(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalDealOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalDealOutput[]>({
        sourceObject,
        targetType: CrmObject.deal,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedDealOutput[];

      //TODO
      const dealIds = sourceObject.map((deal) =>
        'id' in deal ? String(deal.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const deals_data = await this.saveDealsInDb(
        linkedUserId,
        unifiedObject,
        dealIds,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.deal.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        deals_data,
        'crm.deal.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveDealsInDb(
    linkedUserId: string,
    deals: UnifiedDealOutput[],
    originIds: string[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmDeal[]> {
    try {
      let deals_results: CrmDeal[] = [];
      for (let i = 0; i < deals.length; i++) {
        const deal = deals[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingDeal = await this.prisma.crm_deals.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
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
            id_linked_user: linkedUserId,
            description: '',
            amount: deal.amount,
            remote_id: originId,
            remote_platform: originSource,
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

          for (const mapping of deal.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: Object.values(mapping)[0]
                    ? Object.values(mapping)[0]
                    : 'null',
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
      handleServiceError(error, this.logger);
    }
  }
}
