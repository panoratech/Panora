import { ITaskMapper } from '@crm/task/types';
import { ZohoTaskInput, ZohoTaskOutput } from './types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZohoTaskMapper implements ITaskMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'task', 'zoho', this);
  }
  async desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoTaskInput> {
    // todo what_id and owner
    const result: ZohoTaskInput = {
      Description: source.content,
      Subject: source.subject,
    };
    if (source.status) {
      result.Status =
        source.status === 'COMPLETED' ? 'Completed' : 'In Progress';
    }
    if (source.due_date) {
      result.Due_Date = source.due_date.toISOString();
    }
    if (source.finished_date) {
      result.Closed_Time = source.finished_date.toISOString();
    }

    if (source.company_id) {
      result.What_Id.id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      result.What_Id.name = await this.utils.getCompanyNameFromUuid(
        source.company_id,
      );
    }
    if (source.user_id) {
      result.Owner.id = await this.utils.getRemoteIdFromUserUuid(
        source.user_id,
      );
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
    source: ZohoTaskOutput | ZohoTaskOutput[],
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
  ): Promise<UnifiedTaskOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = task[mapping.remote_id];
      }
    }
    const res: UnifiedTaskOutput = {
      remote_id: task.id,
      content: task.Description,
      subject: task.Subject,
      status: task.Status === 'Completed' ? 'COMPLETED' : 'IN PROGRESS',
      finished_date: new Date(task.Closed_Time),
      due_date: new Date(task.Due_Date),
      field_mappings,
    };
    if (task.What_Id.id) {
      res.company_id = await this.utils.getCompanyUuidFromRemoteId(
        task.What_Id.id,
        connectionId,
      );
    }
    if (task.Owner.id) {
      res.user_id = await this.utils.getUserUuidFromRemoteId(
        task.Owner.id,
        connectionId,
      );
    }
    return res;
  }
}
