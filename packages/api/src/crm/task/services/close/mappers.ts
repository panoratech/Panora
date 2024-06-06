import { CloseTaskInput, CloseTaskOutput } from './types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';

export class CloseTaskMapper implements ITaskMapper {
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
  ): Promise<CloseTaskInput> {
    const result: CloseTaskInput = {
      text: source?.content ?? '',
      is_complete: source.status === 'COMPLETED',
      _type: 'lead',
      lead_id: '',
      assigned_to: '',
      date: '',
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.assigned_to = owner_id;
      }
    }
    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.lead_id = company_id;
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
    source: CloseTaskOutput | CloseTaskOutput[],
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
    task: CloseTaskOutput,
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
    if (task.assigned_to) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.assigned_to,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (task.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        task.contact_id,
        'close',
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (task.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        task.lead_id,
        'close',
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }

    return {
      remote_id: task.id,
      subject: '',
      content: task.text,
      status: task?.is_complete ? 'COMPLETED' : 'PENDING',
      due_date: new Date(task.due_date),
      finished_date: task.finished_date ? new Date(task.finished_date) : '',
      field_mappings,
      ...opts,
      // Additional fields mapping based on UnifiedTaskOutput structure
    };
  }
}
