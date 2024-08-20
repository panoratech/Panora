import { LeadSquaredTaskInput, LeadSquaredTaskOutput } from './types';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadSquaredTaskMapper implements ITaskMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
  ) {
    this.mappersRegistry.registerService('crm', 'task', 'leadsquared', this);
  }

  formatDateForLeadSquared(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const currentDate = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${year}-${month}-${currentDate} ${hours}:${minutes}:${seconds}`;
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredTaskInput> {
    // Asuming deal_id = opportunity & company_id = lead
    const result: LeadSquaredTaskInput = {
      StatusCode: source.status === 'COMPLETED' ? '1' : '0',
      Name: source.subject,
      Description: source.content,
      RelatedEntity: '0',
    };

    if (source.due_date) {
      result.DueDate = this.formatDateForLeadSquared(source.due_date);
    }

    if (source.finished_date) {
      result.EndDate = this.formatDateForLeadSquared(source.due_date);
    }

    // deal -> opportunity
    if (source.deal_id) {
      const opportunity_id = await this.utils.getRemoteIdFromDealUuid(
        source.deal_id,
      );
      if (opportunity_id) {
        (result.RelatedEntity = '5'), (result.RelatedEntityId = opportunity_id);
      }
    }
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
      }
    }

    // company -> lead
    if (source.company_id) {
      const lead_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (lead_id) {
        (result.RelatedEntity = '1'), (result.RelatedEntityId = lead_id);
      }
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
    source: LeadSquaredTaskOutput | LeadSquaredTaskOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmTaskOutput | UnifiedCrmTaskOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleTaskToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((task) =>
        this.mapSingleTaskToUnified(task, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleTaskToUnified(
    task: LeadSquaredTaskOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmTaskOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = task[mapping.remote_id];
      }
    }

    let opts: any = {};

    // Means RelatedEntityId = LeadId
    if (task.RelatedEntity === '1') {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        task.RelatedEntityId,
        connectionId,
      );
      if (company_id) {
        opts = {
          ...opts,
          company_id: company_id,
        };
      }
    }
    // Means RelatedEntityId = OpportunityId
    if (task.RelatedEntity === '5') {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        task.RelatedEntityId,
        connectionId,
      );
      if (deal_id) {
        opts = {
          ...opts,
          deal_id,
        };
      }
    }

    if (task.OwnerId) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        task.OwnerId,
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
          user_id: user_id,
        };
      }
    }

    return {
      remote_id: task.UserTaskId,
      remote_data: task,
      content: task.Description,
      status: task.StatusCode === '1' ? 'COMPLETED' : 'PENDING',
      finished_date: task.EndDate ? new Date(task.EndDate.split(' ')[0]) : null,
      due_date: task.DueDate ? new Date(task.DueDate.split(' ')[0]) : null,
      field_mappings,
      ...opts,
    };
  }
}
