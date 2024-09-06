import { IContactMapper } from '@ticketing/contact/types';
import { GorgiasContactInput, GorgiasContactOutput } from './types';
import {
  UnifiedTicketingContactInput,
  UnifiedTicketingContactOutput,
} from '@ticketing/contact/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GorgiasContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'contact',
      'gorgias',
      this,
    );
  }
  desunify(
    source: UnifiedTicketingContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasContactInput {
    return;
  }

  unify(
    source: GorgiasContactOutput | GorgiasContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingContactOutput | UnifiedTicketingContactOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((contact) =>
      this.mapSingleContactToUnified(
        contact,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleContactToUnified(
    contact: GorgiasContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingContactOutput {
    const unifiedContact: UnifiedTicketingContactOutput = {
      remote_id: String(contact.id),
      remote_data: contact,
      name: contact.name,
      email_address: contact.email,
    };

    return unifiedContact;
  }
}
