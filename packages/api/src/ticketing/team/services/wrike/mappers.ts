import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { ITeamMapper } from "@ticketing/team/types";
import { UnifiedTeamInput, UnifiedTeamOutput } from "@ticketing/team/types/model.unified";
import { WrikeTeamInput, WrikeTeamOutput } from "./types";

@Injectable()
export class WrikeTeamMapper implements ITeamMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'team', 'wrike', this);
  }
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): WrikeTeamInput {
    return;
  }

  unify(
    source: WrikeTeamOutput | WrikeTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[] {
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((team) =>
      this.mapSingleTeamToUnified(team, customFieldMappings),
    );
  }

  private mapSingleTeamToUnified(
    team: WrikeTeamOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput {
    const unifiedTeam: UnifiedTeamOutput = {
      remote_id: team.id,
      name: team.name,
    };

    return unifiedTeam;
  }
}