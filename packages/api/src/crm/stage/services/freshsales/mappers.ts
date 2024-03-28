import { IStageMapper } from '@crm/stage/types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { FreshsalesStageInput, FreshsalesStageOutput } from './types';

//TODO
export class FreshsalesStageMapper implements IStageMapper {
  desunify(source: UnifiedStageInput): FreshsalesStageInput {
    return;
  }

  unify(
    source: FreshsalesStageOutput | FreshsalesStageOutput[],
  ): UnifiedStageOutput | UnifiedStageOutput[] {
    // Handling single FreshsalesStageOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesStageToUnified(source);
    }

    // Handling array of FreshsalesStageOutput
    return source.map((stage) => this.mapSingleFreshsalesStageToUnified(stage));
  }

  private mapSingleFreshsalesStageToUnified(
    stage: FreshsalesStageOutput,
  ): UnifiedStageOutput {
    return;
  }
}
