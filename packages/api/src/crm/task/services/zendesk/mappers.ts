import { ZendeskTaskInput, ZendeskTaskOutput } from './types';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'zendesk', this);
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskTaskInput> {
    const result: ZendeskTaskInput = {
      content: source.content,
      completed: source.status === 'COMPLETED',
    };

    if (source.due_date) {
      result.due_date = source.due_date as any;
    }
    if (source.deal_id) {
      const deal_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (deal_id) {
        result.resource_id = Number(deal_id);
        result.resource_type = 'deal';
      }
    }
    if (source.user_id) {
      const user_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (user_id) {
        result.owner_id = Number(user_id);
      }
    }

    if (source.company_id) {
      //then the resource mut be contact and nothign else
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.resource_id = Number(company_id);
        result.resource_type = 'contact';
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
    source: ZendeskTaskOutput | ZendeskTaskOutput[],
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
    task: ZendeskTaskOutput,
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
    const type = task.resource_type;

    if (type == 'deal') {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(task.resource_id),
        connectionId,
      );
      if (deal_id) {
        opts = {
          ...opts,
          deal_id: deal_id,
        };
      }
    }

    if (type == 'contact') {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(task.resource_id),
        connectionId,
      );
      if (company_id) {
        opts = {
          ...opts,
          company_id: company_id,
        };
      }
    }

    if (task.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(task.owner_id),
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
      remote_id: String(task.id),
      remote_data: task,
      content: task.content,
      status: task.completed ? 'COMPLETED' : 'PENDING',
      finished_date: task.completed_at ? new Date(task.completed_at) : null,
      due_date: task.due_date ? new Date(task.due_date) : null,
      field_mappings,
      ...opts,
    };
  }
}
