import { ITeamMapper } from '@ticketing/team/types';
import { ZendeskTeamInput, ZendeskTeamOutput } from './types';
import {
  UnifiedTeamInput,
  UnifiedTeamOutput,
} from '@ticketing/team/types/model.unified';

export class ZendeskTeamMapper implements ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskTeamInput {
    return;
  }

  unify(
    source: ZendeskTeamOutput | ZendeskTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleTeamToUnified(source, customFieldMappings);
    }
    return source.map((ticket) =>
      this.mapSingleTeamToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTeamToUnified(
    ticket: ZendeskTeamOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput {
    return;
  }
}
