import { IAccountMapper } from '@ticketing/account/types';
import { GithubAccountInput, GithubAccountOutput } from './types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';

export class GithubAccountMapper implements IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubAccountInput {
    return;
  }

  unify(
    source: GithubAccountOutput | GithubAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[] {
    return;
  }
}
