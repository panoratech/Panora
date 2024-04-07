import { IUserMapper } from '@crm/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@crm/user/types/model.unified';
import { FreshsalesUserOutput, FreshsalesUserInput } from './types';

//TODO
export class FreshsalesUserMapper implements IUserMapper {
  desunify(source: UnifiedUserInput): FreshsalesUserInput {
    return;
  }

  unify(
    source: FreshsalesUserOutput | FreshsalesUserOutput[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    // Handling single FreshsalesUserOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesUserToUnified(source);
    }

    // Handling array of FreshsalesUserOutput
    return source.map((user) => this.mapSingleFreshsalesUserToUnified(user));
  }

  private mapSingleFreshsalesUserToUnified(
    user: FreshsalesUserOutput,
  ): UnifiedUserOutput {
    return;
  }
}
