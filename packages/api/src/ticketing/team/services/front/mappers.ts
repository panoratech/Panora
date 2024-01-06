import { ITeamMapper } from '@ticketing/team/types';
import { FrontTeamInput, FrontTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class FrontTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontTeamInput {
    return;
  }

  unify(
    source: FrontTeamOutput | FrontTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((team) =>
      this.mapSingleTeamToUnified(team, customFieldMappings),
    );
  }

  private mapSingleTeamToUnified(
    team: FrontTeamOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput {
    const unifiedTeam: UnifiedTeamOutput = {
      name: team.name,
    };

    return unifiedTeam;
  }
}
