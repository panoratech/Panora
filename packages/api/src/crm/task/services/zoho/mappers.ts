import { ITaskMapper } from '@crm/task/types';
import { ZohoTaskInput, ZohoTaskOutput } from './types';
import {
  TaskStatus,
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZohoTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'zoho', this);
  }

  mapToTaskStatus(
    data:
      | 'Not Started'
      | 'Deferred'
      | 'In Progress'
      | 'Completed'
      | 'Waiting on someone else',
  ): TaskStatus | string {
    switch (data) {
      case 'In Progress':
        return 'PENDING';
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
        return 'In Progress';
    }
  }

  async desunify(
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoTaskInput> {
    return;
  }

  async unify(
    source: ZohoTaskOutput | ZohoTaskOutput[],
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
      source.map((deal) =>
        this.mapSingleTaskToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleTaskToUnified(
    task: ZohoTaskOutput,
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
    const res: UnifiedCrmTaskOutput = {
      remote_id: task.id,
      remote_data: task,
      content: task.Description,
      subject: task.Subject,
      status: this.mapToTaskStatus(task.Status as any),
      finished_date: new Date(task.Closed_Time),
      due_date: new Date(task.Due_Date),
      field_mappings,
    };
    if (task.What_Id && task.What_Id.id) {
      res.company_id = await this.utils.getCompanyUuidFromRemoteId(
        task.What_Id.id,
        connectionId,
      );
    }
    if (task.Owner && task.Owner.id) {
      res.user_id = await this.utils.getUserUuidFromRemoteId(
        task.Owner.id,
        connectionId,
      );
    }
    return res;
  }
}
