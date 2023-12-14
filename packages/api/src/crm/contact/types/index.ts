import { UnifiedContactOutput } from './model.unified';

export class ApiResponse<T> {
  data: T;
  remote_data?: Record<string, any>;
  message?: string;
  error?: string;
  statusCode: number;
}

export type Email = {
  email_address: string;
  email_address_type: string;
  owner_type?: string;
};

export type Phone = {
  phone_number: string;
  phone_type: string;
  owner_type?: string;
};

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};

export class ContactResponse {
  contacts: UnifiedContactOutput[];
  remote_data?: Record<string, any>[]; //data in original format
}
