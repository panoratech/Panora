import { ITaskMapper } from '@crm/task/types';
import {
  UnifiedTaskInput,
  UnifiedTaskOutput,
} from '@crm/task/types/model.unified';
import { FreshsalesTaskInput, FreshsalesTaskOutput } from '@crm/@utils/@types';

//TODO
export class FreshsalesTaskMapper implements ITaskMapper {
  desunify(source: UnifiedTaskInput): FreshsalesTaskInput {
    return;
  }

  async unify(
    source: FreshsalesTaskOutput | FreshsalesTaskOutput[],
  ): Promise<UnifiedTaskOutput | UnifiedTaskOutput[]> {
    // Handling single FreshsalesTaskOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesTaskToUnified(source);
    }

    // Handling array of FreshsalesTaskOutput
    return source.map((task) => this.mapSingleFreshsalesTaskToUnified(task));
  }

  private mapSingleFreshsalesTaskToUnified(
    task: FreshsalesTaskOutput,
  ): UnifiedTaskOutput {
    return;
  }
}
