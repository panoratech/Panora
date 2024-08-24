import { IAccountMapper } from '@ticketing/account/types';
import { FrontAccountInput, FrontAccountOutput } from './types';
import {
  UnifiedTicketingAccountInput,
  UnifiedTicketingAccountOutput,
} from '@ticketing/account/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class FrontAccountMapper implements IAccountMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'account', 'front', this);
  }
  desunify(
    source: UnifiedTicketingAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontAccountInput {
    return;
  }

  unify(
    source: FrontAccountOutput | FrontAccountOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingAccountOutput | UnifiedTicketingAccountOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((account) =>
      this.mapSingleAccountToUnified(
        account,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleAccountToUnified(
    account: FrontAccountOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingAccountOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = account.custom_fields[mapping.remote_id];
      }
    }

    const unifiedAccount: UnifiedTicketingAccountOutput = {
      remote_id: account.id,
      name: account.name,
      domains: account.domains.flat(),
      field_mappings: field_mappings,
      remote_data: account
    };

    return unifiedAccount;
  }
}
