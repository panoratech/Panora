import { ZendeskContactInput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from 'src/crm/contact/dto/create-contact.dto';
import { Unified, UnifySourceType } from '../../../../types';

export function mapToZendeskContact<T extends Unified>(
  source: T,
): ZendeskContactInput {
  const source_ = source as UnifiedContactInput;
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source_.email_addresses?.[0]?.email_address;
  const primaryPhone = source_.phone_numbers?.[0]?.phone_number;

  return {
    name: `${source_.first_name} ${source_.last_name}`,
    first_name: source_.first_name,
    last_name: source_.last_name,
    email: primaryEmail,
    phone: primaryPhone,
  };
}
//TODO
export function mapToUnifiedContact<
  T extends UnifySourceType | UnifySourceType[],
>(source: T): UnifiedContactOutput | UnifiedContactOutput[] {
  return;
}
