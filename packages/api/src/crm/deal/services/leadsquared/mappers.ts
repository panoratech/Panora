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

@Injectable()
export class LeadSquaredDealMapper implements IDealMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('crm', 'deal', 'leadsquared', this);
  }
  formatDateForLeadSquared(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const currentDate = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${currentDate} ${hours}:${minutes}:${seconds}`;
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredDealInput> {
    const result: LeadSquaredDealInput = {
      LeadDetails: [],
      Opportunity: {
        OpportunityNote: source.name,
        OpportunityDateTime: this.formatDateForLeadSquared(new Date()),
        OpportunityEventCode: 11,
        UpdateEmptyFields: true,
        DoNotPostDuplicateActivity: true,
        DoNotChangeOwner: true,
        Fields: [
          {
            SchemaName: 'Ammount',
            Value: source.amount.toString(),
          },
          {
            SchemaName: 'Description',
            Value: source.description,
          },
        ],
      },
    };
    if (source.company_id) {
      const leadDetails = [
        {
          Attribute: 'AccountName',
          Value:
            (await this.utils.getCompanyNameFromUuid(source.company_id)) || '',
        },
        {
          Attribute: 'ProspectID',
          Value: await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
        },
        {
          Attribute: 'SearchBy',
          Value: 'ProspectId',
        },
        {
          Attribute: '__UseUserDefinedGuid__',
          Value: 'true',
        },
      ];
      result.LeadDetails = [...result.LeadDetails, ...leadDetails];
    }
    if (source.stage_id) {
      result.Opportunity.Fields.push({
        SchemaName: 'StageId',
        Value: await this.utils.getStageNameFromStageUuid(source.stage_id),
      });
    }
    if (source.user_id) {
      result.Opportunity.Fields.push({
        SchemaName: 'OwnerId',
        Value: await this.utils.getRemoteIdFromUserUuid(source.user_id),
      });
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
          result.Opportunity.Fields.push({
            SchemaName: k,
            Value: v,
          });
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
      description: deal['Description']?.toString() || deal.OpportunityNote,
      amount: Number(deal.Amount),
      field_mappings,
    };

    if (deal.OwnerId) {
      res.user_id = await this.utils.getUserUuidFromRemoteId(
        deal.OwnerId as string,
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
