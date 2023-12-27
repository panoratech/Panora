import { HubspotContactInput, HubspotContactOutput } from '@crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';
import { UnifySourceType } from '@@core/utils/types';
import { IContactMapper } from '@contact/types';

export class HubspotContactMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotContactInput {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: HubspotContactInput = {
      firstname: source.first_name,
      lastname: source.last_name,
      email: primaryEmail,
      phone: primaryPhone,
    };

    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }
    return result;
  }

  unify<T extends UnifySourceType | UnifySourceType[]>(
    source: T,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    const source_ = source as HubspotContactOutput | HubspotContactOutput[];

    if (!Array.isArray(source_)) {
      return this.mapSingleHubspotContactToUnified(
        source_,
        customFieldMappings,
      );
    }
    // Handling array of HubspotContactOutput
    return source_.map((contact) =>
      this.mapSingleHubspotContactToUnified(contact, customFieldMappings),
    );
  }

  mapSingleHubspotContactToUnified(
    contact: HubspotContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: contact.properties[mapping.remote_id],
    }));
    return {
      first_name: contact.properties.firstname,
      last_name: contact.properties.lastname,
      email_addresses: [
        {
          email_address: contact.properties.email,
          email_address_type: 'primary',
        },
      ],
      phone_numbers: [
        { phone_number: '' /*contact.properties.*/, phone_type: 'primary' },
      ],
      field_mappings,
    };
  }
}
