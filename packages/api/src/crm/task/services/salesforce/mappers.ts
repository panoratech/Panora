import { SalesforceTaskInput, SalesforceTaskOutput } from './types';
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
export class SalesforceTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'salesforce', this);
  }

  mapToTaskStatus(data: string): TaskStatus {
    switch (data) {
      case 'Not Started':
        return 'PENDING';
      case 'Completed':
        return 'COMPLETED';
      default:
        return data;
    }
  }

  reverseMapToTaskStatus(data: TaskStatus): string {
    switch (data) {
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SalesforceTaskInput> {
    const result: SalesforceTaskInput = {
      Subject: source.subject || '',
      Description: source.content || '',
      Status: this.reverseMapToTaskStatus(source.status as TaskStatus),
      //Priority: source.priority || 'Normal',
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
      }
    }

    if (source.deal_id) {
      const id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      result.WhatId = id;
    } else if (source.company_id) {
      const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
      result.WhatId = id;
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
    source: SalesforceTaskOutput | SalesforceTaskOutput[],
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
    task: SalesforceTaskOutput,
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
    if (task.OwnerId) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        task.OwnerId,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    opts.status = this.mapToTaskStatus(task.Status);

    if (task.WhatId) {
      // Determine if WhatId is a deal or company
      // This might require additional API calls or logic
      // For this example, we'll assume it's a deal, but you should implement proper logic here
      opts.deal_id = await this.utils.getDealUuidFromRemoteId(
        task.WhatId,
        connectionId,
      );
    }

    return {
      remote_id: task.Id,
      remote_data: task,
      subject: task.Subject,
      content: task.Description,
      priority: task.Priority,
      due_date: task.ActivityDate,
      field_mappings,
      ...opts,
    };
  }
}