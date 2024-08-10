export interface ShopifyFulfillmentInput {
  created_at: string;
  id: number;
  line_items: ShopifyLineItem[];
  location_id: number;
  name: string;
  order_id: number;
  origin_address: ShopifyAddress[];
  receipt: ShopifyReceipt;
  service: string;
  shipment_status: string;
  status: string;
  tracking_company: string;
  tracking_numbers: string[];
  tracking_number: string;
  tracking_urls: string[];
  tracking_url: string;
  updated_at: string;
  variant_inventory_management: string;
}

export type ShopifyFulfillmentOutput = Partial<ShopifyFulfillmentInput>;

interface ShopifyDuty {
  id: string;
  harmonized_system_code: string;
  country_code_of_origin: string;
  shop_money: {
    amount: string;
    currency_code: string;
  };
  presentment_money: {
    amount: string;
    currency_code: string;
  };
  tax_lines: {
    title: string;
    price: string;
    rate: number;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
  }[];
  admin_graphql_api_id: string;
}

export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  grams: number;
  sku: string;
  variant_title: string;
  vendor: string | null;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  total_discount: string;
  fulfillment_status: string | null;
  fulfillment_line_item_id: number;
  tax_lines: any[];
  duties: ShopifyDuty[];
}

interface ShopifyAddress {
  address1: string;
  address2: string;
  city: string;
  country_code: string;
  province_code: string;
  zip: string;
}

interface ShopifyReceipt {
  testcase: boolean;
  authorization: string;
}
