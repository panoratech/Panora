export interface ShopifyOrderInput {
  app_id: number;
  billing_address: Address;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: string;
  cancelled_at: string | null;
  cart_token: string;
  checkout_token: string;
  client_details: ClientDetails;
  closed_at: string;
  company: Company;
  confirmation_number: string;
  confirmed: boolean;
  created_at: string;
  currency: string;
  current_total_additional_fees_set: MoneySet;
  current_total_discounts: string;
  current_total_discounts_set: {
    current_total_discounts_set: MoneySet;
  };
  current_total_duties_set: {
    current_total_duties_set: MoneySet;
  };
  current_total_price: string;
  current_total_price_set: {
    current_total_price_set: MoneySet;
  };
  current_subtotal_price: string;
  current_subtotal_price_set: {
    current_subtotal_price_set: MoneySet;
  };
  current_total_tax: string;
  current_total_tax_set: {
    current_total_tax_set: MoneySet;
  };
  customer: Customer;
  customer_locale: string;
  discount_applications: DiscountApplication[];
  discount_codes: DiscountCode[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillments: Fulfillment[];
  fulfillment_status: string;
  gateway: string;
  id: number;
  landing_site: string;
  line_items: Partial<LineItem>[];
  location_id: number;
  merchant_of_record_app_id: number;
  name: string;
  note: string;
  note_attributes: NoteAttribute[];
  number: number;
  order_number: number;
  original_total_additional_fees_set: MoneySet;
  original_total_duties_set: {
    original_total_duties_set: MoneySet;
  };
  payment_terms: PaymentTerm;
  payment_gateway_names: string[];
  phone: string;
  po_number: string;
  presentment_currency: string;
  processed_at: string;
  referring_site: string;
  refunds: Refund[];
  shipping_address: Address;
  shipping_lines: ShippingLine[];
  source_name: string;
  source_identifier: string;
  source_url: string;
  subtotal_price: string;
  subtotal_price_set: MoneySet;
  tags: string;
  tax_lines: TaxLine[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: MoneySet;
  total_line_items_price: string;
  total_line_items_price_set: MoneySet;
  total_outstanding: string;
  total_price: string;
  total_price_set: MoneySet;
  total_shipping_price_set: MoneySet;
  total_tax: string | number;
  total_tax_set: MoneySet;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number;
  order_status_url: {
    order_status_url: string;
  };
}

export type ShopifyOrderOutput = Partial<ShopifyOrderInput>;

type Money = {
  amount: string;
  currency_code: string;
};

type MoneySet = {
  shop_money: Money;
  presentment_money: Money;
};

type Address = {
  address1: string;
  address2: string;
  city: string;
  company: string | null;
  country: string;
  first_name: string;
  last_name: string;
  phone: string;
  province: string;
  zip: string;
  name: string;
  province_code: string;
  country_code: string;
  latitude: string;
  longitude: string;
};

type ClientDetails = {
  accept_language: string;
  browser_height: number;
  browser_ip: string;
  browser_width: number;
  session_hash: string;
  user_agent: string;
};

type Company = {
  id: number;
  location_id: number;
};

type Customer = {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  state: string;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  tax_exemptions: Record<string, any>;
  phone: string;
  tags: string;
  currency: string;
  addresses: Record<string, any>;
  admin_graphql_api_id: string;
  default_address: Record<string, any>;
};

type DiscountApplication = {
  type: string;
  title?: string;
  description?: string;
  value: string;
  value_type: string;
  allocation_method: string;
  target_selection: string;
  target_type: string;
  code?: string;
};

type DiscountCode = {
  code: string;
  amount: string;
  type: string;
};

type Fulfillment = {
  created_at: string;
  id: number;
  order_id: number;
  status: string;
  tracking_company: string;
  tracking_number: string;
  updated_at: string;
};

type LineItem = {
  attributed_staffs?: {
    id: string;
    quantity: number;
  }[];
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string;
  grams: number;
  id: number;
  price: string;
  product_id: number;
  quantity: number;
  current_quantity: number;
  requires_shipping: boolean;
  sku: string;
  title: string;
  variant_id: number;
  variant_title: string;
  vendor: string | null;
  name: string;
  gift_card: boolean;
  price_set: MoneySet;
  properties: {
    name: string;
    value: string;
  }[];
  taxable: boolean;
  tax_lines: Partial<{
    title: string;
    price: string;
    price_set: MoneySet;
    channel_liable: boolean;
    rate: number;
  }>[];
  total_discount: string;
  total_discount_set: MoneySet;
  discount_allocations: {
    amount: string;
    discount_application_index: number;
    amount_set: MoneySet;
  }[];
  origin_location: {
    id: number;
    country_code: string;
    province_code: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    zip: string;
  };
  duties: {
    id: string;
    harmonized_system_code: string;
    country_code_of_origin: string;
    shop_money: Money;
    presentment_money: Money;
    tax_lines: {
      title: string;
      price: string;
      price_set: MoneySet;
      rate: number;
      channel_liable: boolean;
    }[];
    admin_graphql_api_id: string;
  }[];
};

type NoteAttribute = {
  name: string;
  value: string;
};

type PaymentTerm = {
  amount: number;
  currency: string;
  payment_terms_name: string;
  payment_terms_type: string;
  due_in_days: number;
  payment_schedules: {
    amount: number;
    currency: string;
    issued_at: string;
    due_at: string;
    completed_at: string | null;
    expected_payment_method: string;
  }[];
};

type Refund = {
  id: number;
  order_id: number;
  created_at: string;
  note: string | null;
  user_id: string | null;
  processed_at: string;
  refund_line_items: any[];
  transactions: any[];
  order_adjustments: any[];
};

type ShippingLine = {
  code: string;
  price: string;
  price_set: MoneySet;
  discounted_price: string;
  discounted_price_set: MoneySet;
  source: string;
  title: string;
  tax_lines: any[];
  carrier_identifier: string;
  requested_fulfillment_service_id: string;
  is_removed: boolean;
};

type TaxLine = {
  price: number;
  rate: number;
  title: string;
  channel_liable: boolean;
};
