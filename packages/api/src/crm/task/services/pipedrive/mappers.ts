import { PipedriveTaskInput, PipedriveTaskOutput } from '@crm/@utils/@types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';

export class PipedriveTaskMapper implements ITaskMapper {
  desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveTaskInput {
    return;
  }

  unify(
    source: PipedriveTaskOutput | PipedriveTaskOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTaskOutput | UnifiedTaskOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleTaskToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotTaskOutput
    return source.map((task) =>
      this.mapSingleTaskToUnified(task, customFieldMappings),
    );
  }

  private mapSingleTaskToUnified(
    task: PipedriveTaskOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTaskOutput {
    return;
  }
}
