import { HubspotTaskInput, HubspotTaskOutput } from './types';
import {
  TaskStatus,
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'hubspot', this);
  }

  mapToTaskStatus(data: 'COMPLETED' | 'NOT_STARTED'): TaskStatus {
    switch (data) {
      case 'NOT_STARTED':
        return 'PENDING';
      case 'COMPLETED':
        return 'COMPLETED';
    }
  }
  reverseMapToTaskStatus(data: TaskStatus): string {
    switch (data) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'PENDING':
        return 'NOT_STARTED';
    }
  }

  async desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotTaskInput> {
    const result: any = {
      hs_task_subject: source.subject || null,
      hs_task_body: source.content || null,
      hs_task_priority: null,
      hs_timestamp: source.due_date
        ? source.due_date.toISOString()
        : new Date().toISOString(),
    };
    if (source.status) {
      result.hs_task_status = this.reverseMapToTaskStatus(
        source.status as TaskStatus,
      );
    }

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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput | UnifiedTaskOutput[]> {
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
    task: HubspotTaskOutput,
    connectionId: string,
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
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (task.properties.hs_task_status) {
      opts.status = this.mapToTaskStatus(task.properties.hs_task_status as any);
    }
    return {
      remote_id: task.id,
      subject: task.properties.hs_task_subject,
      content: task.properties.hs_task_body,
      due_date: new Date(task.properties.hs_timestamp),
      field_mappings,
      ...opts,
    };
  }
}
