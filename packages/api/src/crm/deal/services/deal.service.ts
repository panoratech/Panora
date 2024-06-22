import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedDealInput, UnifiedDealOutput } from '../types/model.unified';
import { CrmObject } from '@crm/@lib/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { IDealService } from '../types';
import { throwTypedError, UnifiedCrmError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class DealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(DealService.name);
  }

  async batchAddDeals(
    unifiedDealData: UnifiedDealInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDealOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedDealData.map((unifiedData) =>
          this.addDeal(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throw error;
    }
  }

  async addDeal(
    unifiedDealData: UnifiedDealInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedDealOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      //CHECKS
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');

      const stage = unifiedDealData.stage_id;
      //check if contact_id and account_id refer to real uuids
      if (stage) {
        const search = await this.prisma.crm_deals_stages.findUnique({
          where: {
            id_crm_deals_stage: stage,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a stage_id which does not exist',
          );
      }

      const user = unifiedDealData.user_id;
      //check if contact_id and account_id refer to real uuids
      if (user) {
        const search = await this.prisma.crm_users.findUnique({
          where: {
            id_crm_user: user,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a user_id which does not exist',
          );
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedDealInput>({
          sourceObject: unifiedDealData,
          targetType: CrmObject.deal,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: [],
        });

      const service: IDealService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalDealOutput> = await service.addDeal(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalDealOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.deal,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings: [],
      })) as UnifiedDealOutput[];

      // add the deal inside our db
      const source_deal = resp.data;
      const target_deal = unifiedObject[0];

      const existingDeal = await this.prisma.crm_deals.findFirst({
        where: {
          remote_id: target_deal.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_crm_deal_id: string;

      if (existingDeal) {
        // Update the existing deal
        let data: any = {
          amount: target_deal.amount,
          modified_at: new Date(),
        };
        if (target_deal.name) {
          data = { ...data, name: target_deal.name };
        }
        if (target_deal.description) {
          data = { ...data, description: target_deal.description };
        }
        if (target_deal.amount) {
          data = { ...data, amount: target_deal.amount };
        }
        if (target_deal.user_id) {
          data = { ...data, id_crm_user: target_deal.user_id };
        }
        if (target_deal.stage_id) {
          data = { ...data, id_crm_deals_stage: target_deal.stage_id };
        }
        if (target_deal.company_id) {
          data = { ...data, id_crm_company: target_deal.company_id };
        }

        const res = await this.prisma.crm_deals.update({
          where: {
            id_crm_deal: existingDeal.id_crm_deal,
          },
          data: data,
        });
        unique_crm_deal_id = res.id_crm_deal;
      } else {
        // Create a new deal
        this.logger.log('deal not exists');
        let data: any = {
          id_crm_deal: uuidv4(),
          amount: target_deal.amount,
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_deal.remote_id,
          remote_platform: integrationId,
          description: '',
        };

        if (target_deal.name) {
          data = { ...data, name: target_deal.name };
        }
        if (target_deal.description) {
          data = { ...data, description: target_deal.description };
        }
        if (target_deal.amount) {
          data = { ...data, amount: target_deal.amount };
        }
        if (target_deal.user_id) {
          data = { ...data, id_crm_user: target_deal.user_id };
        }
        if (target_deal.stage_id) {
          data = { ...data, id_crm_deals_stage: target_deal.stage_id };
        }
        if (target_deal.company_id) {
          data = { ...data, id_crm_company: target_deal.company_id };
        }
        const res = await this.prisma.crm_deals.create({
          data: data,
        });
        unique_crm_deal_id = res.id_crm_deal;
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
          data: JSON.stringify(source_deal),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_deal),
          created_at: new Date(),
        },
      });

      const result_deal = await this.getDeal(unique_crm_deal_id, remote_data);

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.deal.push', //sync, push or pull
          method: 'POST',
          url: '/crm/deals',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_deal,
        'crm.deal.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_deal;
    } catch (error) {
      throw error;
    }
  }

  async getDeal(
    id_dealing_deal: string,
    remote_data?: boolean,
  ): Promise<UnifiedDealOutput> {
    try {
      const deal = await this.prisma.crm_deals.findUnique({
        where: {
          id_crm_deal: id_dealing_deal,
        },
      });

      // Fetch field mappings for the deal
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: deal.id_crm_deal,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedDealOutput format
      const unifiedDeal: UnifiedDealOutput = {
        id: deal.id_crm_deal,
        name: deal.name,
        description: deal.description,
        amount: Number(deal.amount),
        stage_id: deal.id_crm_deals_stage, // uuid of Stage object
        user_id: deal.id_crm_user, // uuid of User object
        field_mappings: field_mappings,
      };

      let res: UnifiedDealOutput = {
        ...unifiedDeal,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: deal.id_crm_deal,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getDeals(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedDealOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_deals.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_crm_deal: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const deals = await this.prisma.crm_deals.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_deal: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (deals.length === limit + 1) {
        next_cursor = Buffer.from(deals[deals.length - 1].id_crm_deal).toString(
          'base64',
        );
        deals.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedDeals: UnifiedDealOutput[] = await Promise.all(
        deals.map(async (deal) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: deal.id_crm_deal,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedDealOutput format
          return {
            id: deal.id_crm_deal,
            name: deal.name,
            description: deal.description,
            amount: Number(deal.amount),
            stage_id: deal.id_crm_deals_stage, // uuid of Stage object
            user_id: deal.id_crm_user, // uuid of User object
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedDealOutput[] = unifiedDeals;

      if (remote_data) {
        const remote_array_data: UnifiedDealOutput[] = await Promise.all(
          res.map(async (deal) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: deal.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...deal, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.deal.pulled',
          method: 'GET',
          url: '/crm/deals',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateDeal(
    id_dealing_deal: string,
    data?: Partial<UnifiedDealInput>,
  ): Promise<UnifiedDealOutput> {
    return;
  }
}
