import { ZendeskTaskInput, ZendeskTaskOutput } from '@crm/@utils/@types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/task/utils';

export class ZendeskTaskMapper implements ITaskMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskTaskInput> {
    const result: ZendeskTaskInput = {
      content: source.content,
      completed: source.status === 'Completed',
      completed_at: source.finished_date
        ? source.finished_date.toISOString()
        : '',
      due_date: source.due_date ? source.due_date.toISOString() : '',
      remind_at: '', // Placeholder, adjust as needed
    };

    if (source.deal_id) {
      const deal_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (deal_id) {
        result.resource_id = Number(deal_id);
        result.resource_type = 'deal';
      }
    }
    if (source.user_id) {
      const user_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (user_id) {
        result.owner_id = user_id;
      }
    }

    /*if (source.company_id) {
      //then the resource mut be contact and nothign else
      const contact_id = await this.utils.getRemoteIdFromContactUuid(
        source.contact_id,
      );
      if (contact_id) {
        result.resource_id = Number(contact_id);
        result.resource_type = 'contact';
      }
    } else {
      if (source.deal_id) {
        const deal_id = await this.utils.getRemoteIdFromDealUuid(
          source.deal_id,
        );
        if (deal_id) {
          result.resource_id = Number(deal_id);
          result.resource_type = 'deal';
        }
      }
    }*/

    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  async unify(
    source: ZendeskTaskOutput | ZendeskTaskOutput[],
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
    task: ZendeskTaskOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: task[mapping.remote_id],
      })) || [];

    let opts: any = {};
    const type = task.resource_type;

    if (type == 'deal') {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(task.resource_id),
        'zendesk',
      );
      if (deal_id) {
        opts = {
          deal_id: deal_id,
        };
      }
    }

    if (task.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(task.owner_id),
        'zendesk',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    return {
      content: task.content,
      status: task.completed ? 'Completed' : 'Pending',
      finished_date: task.completed_at
        ? new Date(task.completed_at)
        : undefined,
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      field_mappings,
      ...opts,
    };
  }
}
