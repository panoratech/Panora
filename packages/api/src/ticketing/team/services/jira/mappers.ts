import { ITeamMapper } from '@ticketing/team/types';
import { JiraTeamInput, JiraTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class JiraTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraTeamInput {
    return;
  }

  unify(
    source: JiraTeamOutput | JiraTeamOutput[],
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
    team: JiraTeamOutput,
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
