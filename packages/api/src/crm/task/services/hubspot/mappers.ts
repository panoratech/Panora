import { HubspotTaskInput, HubspotTaskOutput } from './types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';

export class HubspotTaskMapper implements ITaskMapper {
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
  ): Promise<HubspotTaskInput> {
    const result: HubspotTaskInput = {
      hs_task_subject: source.subject || '',
      hs_task_body: source.content || '',
      hs_task_status: source.status,
      hs_task_priority: '',
      hs_timestamp: source.due_date
        ? source.due_date.toISOString()
        : new Date().toISOString(),
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
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
    source: HubspotTaskOutput | HubspotTaskOutput[],
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
    task: HubspotTaskOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = task.properties[mapping.remote_id];
      }
    }
    let opts: any = {};
    if (task.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    return {
      remote_id: task.id,
      subject: task.properties.hs_task_subject,
      content: task.properties.hs_task_body,
      status: task.properties.hs_task_status,
      due_date: new Date(task.properties.hs_timestamp),
      field_mappings,
      ...opts,
      // Additional fields mapping based on UnifiedTaskOutput structure
    };
  }
}
