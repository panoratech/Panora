export class ApiResponse<T> {
  data: T;
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
