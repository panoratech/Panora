import { HubspotTaskInput, HubspotTaskOutput } from './types';
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
    source: UnifiedCrmTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotTaskInput> {
    const result: any = {
      properties: {
        hs_task_subject: source.subject || null,
        hs_task_body: source.content || null,
        hs_task_priority: null,
        hs_timestamp: new Date() as any,
      },
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

    if (source.deal_id) {
      result.associations = result.associations ? [...result.associations] : [];
      const id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      result.associations.push({
        to: {
          id: id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 216,
          },
        ],
      });
    }

    if (source.company_id) {
      result.associations = result.associations ? [...result.associations] : [];
      const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
      result.associations.push({
        to: {
          id: id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 192,
          },
        ],
      });
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
    task: HubspotTaskOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmTaskOutput> {
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
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (task.properties.hs_task_status) {
      opts.status = this.mapToTaskStatus(task.properties.hs_task_status as any);
    }
    if (task.associations) {
      if (task.associations.deals) {
        const remote_id = task.associations.deals.results[0].id;
        opts.deal_id = await this.utils.getDealUuidFromRemoteId(
          remote_id,
          connectionId,
        );
      }
      if (task.associations.companies) {
        const remote_id = task.associations.companies.results[0].id;
        opts.company_id = await this.utils.getCompanyUuidFromRemoteId(
          remote_id,
          connectionId,
        );
      }
    }
    return {
      remote_id: task.id,
      remote_data: task,
      subject: task.properties.hs_task_subject,
      content: task.properties.hs_task_body,
      field_mappings,
      ...opts,
    };
  }
}
