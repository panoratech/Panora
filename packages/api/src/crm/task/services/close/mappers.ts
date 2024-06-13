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
    const emptyPromise = new Promise<string>((resolve) => {
      return resolve('');
    });
    const promises = [];

    promises.push(
      task.assigned_to
        ? await this.utils.getUserUuidFromRemoteId(task.assigned_to, 'close')
        : emptyPromise,
    );
    promises.push(
      task.lead_id
        ? await this.utils.getCompanyUuidFromRemoteId(task.lead_id, 'close')
        : emptyPromise,
    );
    const [user_id, company_id] = await Promise.all(promises);

    return {
      remote_id: task.id,
      subject: '',
      content: task.text,
      status: task?.is_complete ? 'COMPLETED' : 'PENDING',
      due_date: new Date(task.due_date),
      finished_date: task.finished_date ? new Date(task.finished_date) : null,
      field_mappings,
      user_id,
      company_id,
    };
  }
}
