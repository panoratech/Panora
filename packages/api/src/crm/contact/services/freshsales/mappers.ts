import { IContactMapper } from '@crm/contact/types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import {
  FreshsalesContactInput,
  FreshsalesContactOutput,
} from '@crm/@utils/@types';

//TODO
export class FreshsalesContactMapper implements IContactMapper {
  desunify(source: UnifiedContactInput): FreshsalesContactInput {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    return {
      first_name: source.first_name,
      last_name: source.last_name,
      mobile_number: primaryPhone,
    };
  }

  unify(
    source: FreshsalesContactOutput | FreshsalesContactOutput[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    // Handling single FreshsalesContactOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesContactToUnified(source);
    }

    // Handling array of FreshsalesContactOutput
    return source.map((contact) =>
      this.mapSingleFreshsalesContactToUnified(contact),
    );
  }

  private mapSingleFreshsalesContactToUnified(
    contact: FreshsalesContactOutput,
  ): UnifiedContactOutput {
    // Map email and phone details
    const email_addresses = contact.email
      ? [{ email_address: contact.email, email_address_type: 'primary' }]
      : [];
    const phone_numbers = [];
    if (contact.work_number) {
      phone_numbers.push({
        phone_number: contact.work_number,
        phone_type: 'work',
      });
    }
    if (contact.mobile_number) {
      phone_numbers.push({
        phone_number: contact.mobile_number,
        phone_type: 'mobile',
      });
    }

    return {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses,
      phone_numbers,
    };
  }
}
