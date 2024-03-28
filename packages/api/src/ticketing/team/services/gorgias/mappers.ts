import { ITeamMapper } from '@ticketing/team/types';
import { GorgiasTeamInput, GorgiasTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class GorgiasTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasTeamInput {
    return;
  }

  unify(
    source: GorgiasTeamOutput | GorgiasTeamOutput[],
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
    team: GorgiasTeamOutput,
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
