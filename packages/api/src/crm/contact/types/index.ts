export * from './../services/freshsales/types';
export * from './../services/hubspot/types';
export * from './../services/zoho/types';
export * from './../services/zendesk/types';
export * from './../services/pipedrive/types';

export class ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export type Email = {
  email_address: string;
  email_address_type: string;
};

export type Phone = {
  phone_number: string;
  phone_type: string;
};

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};
