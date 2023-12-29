import { HubspotContactInput, HubspotContactOutput } from '@crm/@utils/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { UnifySourceType } from '@@core/utils/types/unfify.output';

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

  unify(
    source: HubspotContactOutput | HubspotContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
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
