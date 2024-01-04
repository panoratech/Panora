import { IAccountMapper } from '@ticketing/account/types';
import { ZendeskAccountInput, ZendeskAccountOutput } from './types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';

export class ZendeskAccountMapper implements IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskAccountInput {
    return;
  }

  unify(
    source: ZendeskAccountOutput | ZendeskAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleAccountToUnified(source, customFieldMappings);
    }
    return source.map((ticket) =>
      this.mapSingleAccountToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleAccountToUnified(
    ticket: ZendeskAccountOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput {
    return;
  }
}
