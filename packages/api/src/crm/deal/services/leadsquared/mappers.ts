import { LeadSquaredDealInput, LeadSquaredDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CrmObject } from '@crm/@lib/@types';
import { UnifiedCrmStageOutput } from '@crm/stage/types/model.unified';
import { ZohoStageOutput } from '@crm/stage/services/zoho/types';

@Injectable()
export class LeadSquaredDealMapper implements IDealMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('crm', 'deal', 'leadsquared', this);
  }
  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredDealInput> {
    const result: LeadSquaredDealInput = {
      OpportunityNote: source.description,
      OpportunityName: source.name,
      Amount: source.amount ?? 0,
    };
    if (source.company_id) {
      result.Account_Name = {
        id: await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
        name: await this.utils.getCompanyNameFromUuid(source.company_id),
      };
    }
    if (source.stage_id) {
      result.Stage = await this.utils.getStageNameFromStageUuid(
        source.stage_id,
      );
    }
    if (source.user_id) {
      result.Owner = {
        id: await this.utils.getRemoteIdFromUserUuid(source.user_id),
      } as any;
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: LeadSquaredDealOutput | LeadSquaredDealOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput | UnifiedCrmDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: LeadSquaredDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal[mapping.remote_id];
      }
    }
    const res: UnifiedCrmDealOutput = {
      remote_id: deal.OpportunityId,
      remote_data: deal,
      name: deal.OpportunityNote,
      description: deal.OpportunityNote ?? '', // todo null
      amount: deal.Amount,
      field_mappings,
    };

    if (deal.Stage) {
      // we insert right way inside our db as there are no endpoint to do so in the Zoho api
      const stage = await this.ingestService.ingestData<
        UnifiedCrmStageOutput,
        ZohoStageOutput
      >(
        [
          {
            Stage_Name: deal.Stage,
          },
        ],
        'leadsquared',
        connectionId,
        'crm',
        CrmObject.stage,
        [],
      );
      res.stage_id = stage[0].id_crm_deals_stage;
    }

    if (deal.ProspectId) {
      res.user_id = await this.utils.getUserUuidFromRemoteId(
        deal.ProspectId,
        connectionId,
      );
    }
    if (deal.LeadOwner) {
      res.company_id = await this.utils.getCompanyUuidFromRemoteId(
        deal.LeadOwner,
        connectionId,
      );
    }
    return res;
  }
}
