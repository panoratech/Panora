import { IContactMapper } from '@ticketing/contact/types';
import { GithubContactInput, GithubContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';

export class GithubContactMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubContactInput {
    return;
  }

  unify(
    source: GithubContactOutput | GithubContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    return;
  }
}
