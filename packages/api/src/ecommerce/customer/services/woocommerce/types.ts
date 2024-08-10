export interface WoocommerceCustomerInput {
  // Customer properties
  readonly id: number;
  readonly date_created: string; // date-time
  readonly date_created_gmt: string; // date-time
  readonly date_modified: string; // date-time
  readonly date_modified_gmt: string; // date-time
  email: string;
  first_name?: string;
  last_name?: string;
  readonly role: string;
  username?: string;
  password?: string; // write-only
  billing: BillingAddress;
  shipping: ShippingAddress;
  readonly is_paying_customer: boolean;
  readonly avatar_url: string;
  meta_data: MetaData[];
}

interface BillingAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface MetaData {
  readonly id: number;
  key: string;
  value: string;
}

export type WoocommerceCustomerOutput = Partial<WoocommerceCustomerInput>;
