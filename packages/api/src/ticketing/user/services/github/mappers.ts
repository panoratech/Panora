import { IUserMapper } from '@ticketing/user/types';
import { GithubUserInput, GithubUserOutput } from './types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';

export class GithubUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubUserInput {
    return;
  }

  unify(
    source: GithubUserOutput | GithubUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    return;
  }
}
