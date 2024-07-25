import { ITeamMapper } from '@ticketing/team/types';
import { FrontTeamInput, FrontTeamOutput } from './types';
import {
  UnifiedTicketingTeamInput,
  UnifiedTicketingTeamOutput,
} from '@ticketing/team/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class FrontTeamMapper implements ITeamMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'team', 'front', this);
  }
  desunify(
    source: UnifiedTicketingTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontTeamInput {
    return;
  }

  unify(
    source: FrontTeamOutput | FrontTeamOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTeamOutput | UnifiedTicketingTeamOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((team) =>
      this.mapSingleTeamToUnified(team, connectionId, customFieldMappings),
    );
  }

  private mapSingleTeamToUnified(
    team: FrontTeamOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTeamOutput {
    const unifiedTeam: UnifiedTicketingTeamOutput = {
      remote_id: team.id,
      remote_data: team,
      name: team.name,
    };

    return unifiedTeam;
  }
}
