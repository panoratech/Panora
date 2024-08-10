export interface WoocommerceOrderInput {
  readonly id: number;
  parent_id?: number;
  readonly number: string;
  readonly order_key: string;
  readonly created_via: string;
  readonly version: string;
  status:
    | 'pending'
    | 'processing'
    | 'on-hold'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'failed'
    | 'trash';
  currency: string;
  readonly date_created: string;
  readonly date_created_gmt: string;
  readonly date_modified: string;
  readonly date_modified_gmt: string;
  readonly discount_total: string;
  readonly discount_tax: string;
  readonly shipping_total: string;
  readonly shipping_tax: string;
  readonly cart_tax: string;
  readonly total: string;
  readonly total_tax: string;
  readonly prices_include_tax: boolean;
  customer_id: number;
  readonly customer_ip_address: string;
  readonly customer_user_agent: string;
  customer_note: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  readonly date_paid: string;
  readonly date_paid_gmt: string;
  readonly date_completed: string;
  readonly date_completed_gmt: string;
  readonly cart_hash: string;
  meta_data: MetaData[];
  line_items: LineItem[];
  readonly tax_lines: TaxLine[];
  shipping_lines: ShippingLine[];
  fee_lines: FeeLine[];
  coupon_lines: CouponLine[];
  readonly refunds: Refund[];
  set_paid?: boolean;
}

interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface MetaData {
  readonly id: number;
  key: string;
  value: string;
}

interface LineItem {
  readonly id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  readonly subtotal_tax: string;
  total: string;
  readonly total_tax: string;
  readonly taxes: TaxLine[];
  meta_data: MetaData[];
  readonly sku: string;
  readonly price: string;
}

interface TaxLine {
  readonly id: number;
  readonly rate_code: string;
  readonly rate_id: number;
  readonly label: string;
  readonly compound: boolean;
  readonly tax_total: string;
  readonly shipping_tax_total: string;
  meta_data: MetaData[];
}

interface ShippingLine {
  readonly id: number;
  method_title: string;
  method_id: string;
  total: string;
  readonly total_tax: string;
  readonly taxes: TaxLine[];
  meta_data: MetaData[];
}

interface FeeLine {
  readonly id: number;
  name: string;
  tax_class: string;
  tax_status: 'taxable' | 'none';
  total: string;
  readonly total_tax: string;
  readonly taxes: TaxLine[];
  meta_data: MetaData[];
}

interface CouponLine {
  readonly id: number;
  code: string;
  readonly discount: string;
  readonly discount_tax: string;
  meta_data: MetaData[];
}

interface Refund {
  readonly id: number;
  readonly reason: string;
  readonly total: string;
}
export type WoocommerceOrderOutput = Partial<WoocommerceOrderInput>;
