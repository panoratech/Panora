import { AttioTaskInput, AttioTaskOutput } from './types';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AttioTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'attio', this);
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AttioTaskInput> {
    const result: AttioTaskInput = {
      data: {
        content: source?.content ?? '',
        format: 'plaintext',
        deadline_at: String(source.due_date) ?? null,
        is_completed: source.status === 'COMPLETED',
        linked_records: [],
        assignees: [],
      },
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.data.assignees.push({
          referenced_actor_type: 'workspace-member',
          referenced_actor_id: owner_id,
        });
      }
    }

    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.data.linked_records.push({
          target_object: 'companies',
          target_record_id: company_id,
        });
      }
    }

    if (source.deal_id) {
      const deal_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (deal_id) {
        result.data.linked_records.push({
          target_object: 'deals',
          target_record_id: deal_id,
        });
      }
    }

    return result;
  }

  async unify(
    source: AttioTaskOutput | AttioTaskOutput[],
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
    task: AttioTaskOutput,
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
    if (task.assignees && task.assignees.length > 0) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.assignees[0].referenced_actor_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (task.assignees && task.assignees.length > 0) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.assignees[0].referenced_actor_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (task.linked_records && task.linked_records.length > 0) {
      for (const record of task.linked_records) {
        switch (record.target_object_id) {
          case 'companies':
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
              record.target_record_id,
              connectionId,
            );
            if (company_id) {
              opts = {
                ...opts,
                company_id: company_id,
              };
            }
            break;
          case 'deals':
            const deal_id = await this.utils.getDealUuidFromRemoteId(
              record.target_record_id,
              connectionId,
            );
            if (deal_id) {
              opts = {
                ...opts,
                deal_id: deal_id,
              };
            }
            break;
        }
      }
    }

    return {
      remote_id: task.id.task_id,
      remote_data: task,
      content: task.content_plaintext,
      status: task.is_completed ? 'COMPLETED' : 'PENDING',
      due_date: new Date(task.deadline_at),
      field_mappings,
      ...opts,
      created_at: new Date(task.created_at),
    };
  }
}
