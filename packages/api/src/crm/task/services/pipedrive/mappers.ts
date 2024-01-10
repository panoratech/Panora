import { PipedriveTaskInput, PipedriveTaskOutput } from '@crm/@utils/@types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/task/utils';

export class PipedriveTaskMapper implements ITaskMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveTaskInput> {
    const result: PipedriveTaskInput = {
      title: source.subject || '',
      description: source.content || '',
      done: source.status === 'Completed' ? 1 : 0,
      due_date: source.due_date ? source.due_date.toISOString() : '',
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.creator_id = Number(owner_id);
      }
    }

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
    source: PipedriveTaskOutput | PipedriveTaskOutput[],
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
    task: PipedriveTaskOutput,
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

    //TODO; user or contact
    if (task.creator_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(task.creator_id),
        'pipedrive',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    return {
      subject: task.title,
      content: task.description,
      status: task.done === 1 ? 'Completed' : 'Pending',
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      field_mappings,
      ...opts,
    };
  }
}
