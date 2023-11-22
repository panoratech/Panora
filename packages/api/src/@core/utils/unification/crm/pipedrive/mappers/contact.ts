import { PipedriveContactInput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from 'src/crm/contact/dto/create-contact.dto';
import { Unified, UnifySourceType } from '../../../../types';

export function mapToPipedriveContact<T extends Unified>(
  source: T,
): PipedriveContactInput {
  const source_ = source as UnifiedContactInput;

  // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry
  const primaryEmail = source_.email_addresses?.[0]?.email_address;
  const primaryPhone = source_.phone_numbers?.[0]?.phone_number;

  // Convert to Pipedrive format if needed
  const emailObject = primaryEmail
    ? [{ value: primaryEmail, primary: true }]
    : [];
  const phoneObject = primaryPhone
    ? [{ value: primaryPhone, primary: true }]
    : [];

  return {
    name: `${source_.first_name} ${source_.last_name}`,
    email: emailObject,
    phone: phoneObject,
    // Map other optional fields as needed
    // label, visible_to, marketing_status, add_time, etc.
  };
}

//TODO
export function mapToUnifiedContact<
  T extends UnifySourceType | UnifySourceType[],
>(source: T): UnifiedContactOutput | UnifiedContactOutput[] {
  return;
}
