import { PipedriveTaskInput, PipedriveTaskOutput } from './types';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PipedriveTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'pipedrive', this);
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveTaskInput> {
    /*const result: PipedriveTaskInput = {
      subject: source.subject || null,
      public_description: source.content || null,
      done: source.status === 'COMPLETED',
      due_date: source.due_date
        ? source.due_date.toISOString().split('T')[0]
        : null,
      due_time: source.due_date
        ? source.due_date.toISOString().split('T')[1]
        : null,
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.user_id = Number(owner_id);
      }
    }
    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.company_id = Number(company_id);
      }
    }
    if (source.deal_id) {
      const deal_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (deal_id) {
        result.deal_id = Number(deal_id);
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
    }*/

    return;
  }

  async unify(
    source: PipedriveTaskOutput | PipedriveTaskOutput[],
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
    task: PipedriveTaskOutput,
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

    if (task.user_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(task.user_id),
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
          user_id: user_id,
        };
      }
    }

    if (task.org_id) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(task.org_id),
        connectionId,
      );
      if (company_id) {
        opts = {
          ...opts,
          company_id: company_id,
        };
      }
    }
    if (task.deal_id) {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(task.deal_id),
        connectionId,
      );
      if (deal_id) {
        opts = {
          ...opts,
          deal_id: deal_id,
        };
      }
    }

    return {
      remote_id: String(task.id),
      remote_data: task,
      subject: task.subject,
      content: task.public_description,
      status: task.done ? 'COMPLETED' : 'PENDING',
      due_date: task.due_date ? new Date(task.due_date) : null,
      finished_date: task.marked_as_done_time
        ? new Date(task.marked_as_done_time)
        : null,
      field_mappings,
      description: '', //todo null
      ...opts,
    };
  }
}
