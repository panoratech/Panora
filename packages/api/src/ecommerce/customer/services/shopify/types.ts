export interface ShopifyCustomerInput {
  addresses: Address[];
  currency: string;
  created_at: string;
  default_address: Address;
  email: string;
  email_marketing_consent: EmailMarketingConsent;
  first_name: string;
  id: number;
  last_name: string;
  last_order_id: number;
  last_order_name: string;
  metafield: Metafield;
  marketing_opt_in_level: string;
  multipass_identifier: string | null;
  note: string;
  orders_count: number;
  password: string;
  password_confirmation: string;
  phone: string;
  sms_marketing_consent: SmsMarketingConsent;
  state: string;
  tags: string;
  tax_exempt: boolean;
  tax_exemptions: string[];
  total_spent: string;
  updated_at: string;
  verified_email: boolean;
}

type Address = {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
};

type EmailMarketingConsent = {
  state: string;
  opt_in_level: string;
  consent_updated_at: string;
};

type Metafield = {
  key: string;
  namespace: string;
  value: string;
  type: string;
};

type SmsMarketingConsent = {
  state: string;
  opt_in_level: string;
  consent_updated_at: string;
  consent_collected_from: string;
};

export type ShopifyCustomerOutput = Partial<ShopifyCustomerInput>;
