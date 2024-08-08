export interface ShopifyProductInput {
  body_html: string;
  created_at: string;
  handle: string;
  id: number;
  images: ProductImage[];
  options: ProductOption;
  product_type: string;
  published_at: string;
  published_scope: string;
  status: string;
  tags: string;
  template_suffix: string;
  title: string;
  updated_at: string;
  variants: ProductVariant[];
  vendor: string;
}

export type ShopifyProductOutput = Partial<ShopifyProductInput>;

export interface ProductImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  src: string;
  variant_ids: any[];
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ProductVariant {
  barcode: string;
  compare_at_price: number | null;
  created_at: string;
  fulfillment_service: string;
  grams: number;
  weight: number;
  weight_unit: string;
  id: number;
  inventory_item_id: number;
  inventory_management: string;
  inventory_policy: string;
  inventory_quantity: number;
  option1: string;
  position: number;
  price: number;
  product_id: number;
  requires_shipping: boolean;
  sku: string;
  taxable: boolean;
  title: string;
  updated_at: string;
}
