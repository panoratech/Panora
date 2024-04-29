import { IAccountMapper } from '@ticketing/account/types';
import { FrontAccountInput, FrontAccountOutput } from './types';
import {
  UnifiedAccountInput,
  UnifiedAccountOutput,
} from '@ticketing/account/types/model.unified';

export class FrontAccountMapper implements IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontAccountInput {
    return;
  }

  unify(
    source: FrontAccountOutput | FrontAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((account) =>
      this.mapSingleAccountToUnified(account, customFieldMappings),
    );
  }

  private mapSingleAccountToUnified(
    account: FrontAccountOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = account.custom_fields[mapping.remote_id];
      }
    }

    const unifiedAccount: UnifiedAccountOutput = {
      name: account.name,
      domains: account.domains.flat(),
      field_mappings: field_mappings,
    };

    return unifiedAccount;
  }
}
