import { PipedriveTaskInput, PipedriveTaskOutput } from './types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/task/utils';

export class PipedriveTaskMapper implements ITaskMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveTaskInput> {
    const result: PipedriveTaskInput = {
      subject: source.subject || '',
      public_description: source.content || '',
      done: source.status === 'Completed',
      due_date: source.due_date
        ? source.due_date.toISOString().split('T')[0]
        : '',
      due_time: source.due_date
        ? source.due_date.toISOString().split('T')[1]
        : '',
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
    }

    return result;
  }

  async unify(
    source: PipedriveTaskOutput | PipedriveTaskOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput | UnifiedTaskOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleTaskToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((task) =>
        this.mapSingleTaskToUnified(task, customFieldMappings),
      ),
    );
  }

  private async mapSingleTaskToUnified(
    task: PipedriveTaskOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput> {
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
        'pipedrive',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    if (task.company_id) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(task.company_id),
        'pipedrive',
      );
      if (company_id) {
        opts = {
          company_id: company_id,
        };
      }
    }
    if (task.deal_id) {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(task.deal_id),
        'pipedrive',
      );
      if (deal_id) {
        opts = {
          deal_id: deal_id,
        };
      }
    }

    return {
      subject: task.subject,
      content: task.public_description,
      status: task.done ? 'Completed' : 'Pending',
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      finished_date: task.marked_as_done_time
        ? new Date(task.marked_as_done_time)
        : undefined,
      field_mappings,
      ...opts,
    };
  }
}
