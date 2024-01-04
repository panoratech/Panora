import { ITeamMapper } from '@ticketing/team/types';
import { GithubTeamInput, GithubTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class GithubTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubTeamInput {
    return;
  }

  unify(
    source: GithubTeamOutput | GithubTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[] {
    return;
  }
}
