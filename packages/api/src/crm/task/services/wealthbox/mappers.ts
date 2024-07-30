import { WealthboxTaskInput, WealthboxTaskOutput } from './types';
import {
  TaskStatus,
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WealthboxTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'Wealthbox', this);
  }

  async desunify(source: UnifiedCrmTaskInput, customFieldMappings?: { slug: string; remote_id: string; }[]): Promise<WealthboxTaskInput> {
    const result: WealthboxTaskInput = {
      name: null,
      due_date: source.due_date,
      complete: source.status === "COMPLETED" ,
      category: null,
      linked_to: null,
      priority: null,
      visible_to: null,
      custom_fields: null,
      assigned_to: null,
      description: source.content,
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.assigned_to = owner_id;
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
    source: WealthboxTaskOutput | WealthboxTaskOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[]
  ): Promise<UnifiedCrmTaskOutput | UnifiedCrmTaskOutput[]> {
    
    if(!Array.isArray(source)) {
      return await this.mapSingleTaskToUnified(
        source,
        connectionId,
        customFieldMappings
      )
    }

    return Promise.all(
      source.map((task) => this.mapSingleTaskToUnified(task, connectionId, customFieldMappings))
    )
  }

  private async mapSingleTaskToUnified(
    task: WealthboxTaskOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmTaskOutput | UnifiedCrmTaskOutput[]> {
    const field_mappings: { [key: string]: any } = {};
    if(customFieldMappings) {
      for(const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = task[mapping.remote_id];
      }
    }

    let opts: any = {};
    if(task.assigned_to) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.assigned_to.toString(),
        connectionId
      )
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (task.linked_to[0].id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        task.linked_to[0].id.toString(),
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }

    return {
      remote_id: task.id,
      remote_data: task,
      subject: null,
      content: task.description,
      status: task?.complete ? 'COMPLETED' : 'PENDING',
      due_date: new Date(task.due_date),
      field_mappings,
      ...opts,
      // Additional fields mapping based on UnifiedCrmTaskOutput structure
    };
  }
}

