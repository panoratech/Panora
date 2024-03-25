import { ITeamMapper } from '@ticketing/team/types';
import { ClickupTeamInput, ClickupTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class ClickupTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ClickupTeamInput {
    return;
  }

  unify(
    source: ClickupTeamOutput | ClickupTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[] {
    return;
  }

  private mapSingleTeamToUnified(
    team: ClickupTeamOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput {
    return;
  }
}
