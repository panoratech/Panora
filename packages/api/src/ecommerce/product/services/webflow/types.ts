// reference: https://docs.developers.webflow.com/data/reference/list-products

export interface WebflowProductOutput {
  product: ProductData;
  skus: SkuData[];
}

export interface WebflowProductInput {
  product: ProductData;
  sku: SkuData;
  publishStatus?: 'staging' | 'live';
}

export interface ProductData {
  id?: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated?: string;
  createdOn?: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData: ProductFieldData;
}

export interface ProductFieldData {
  name: string; // required
  slug: string; // required
  description?: string;
  shippable: boolean;
  skuProperties?: SkuProperty[];
  categories?: string[];
  taxCategory?: string;
  defaultSku?: string;
  ecProductType?: string;
  [key: string]: any; // for custom fields
}

export interface SkuProperty {
  id: string; // required
  name: string; // required
  enum: VariantOption[];
}

export interface VariantOption {
  id: string; // required
  name: string; // required
  slug: string; // required
}

export interface SkuData {
  id?: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated?: string;
  createdOn?: string;
  fieldData: SkuFieldData;
}

export interface SkuFieldData {
  skuValues?: { [key: string]: string }; // maps SKU property ID to SKU value ID
  name: string; // required
  slug: string; // required
  price: Price; // required
  product?: string;
  width?: number;
  length?: number;
  height?: number;
  weight?: number;
  sku: string;
  mainImage?: Image | null;
  moreImages?: Image[];
  downloadFiles?: DownloadFile[];
  compareAtPrice?: Price;
  ecSkuBillingMethod?: 'one-time' | 'subscription';
  ecSkuSubscriptionPlan?: SubscriptionPlan;
  trackInventory?: boolean; // Defaults to false
  quantity?: number;
  [key: string]: any; // for custom
}

export interface Price {
  value: number; // required
  unit: string; // required
}

export interface SubscriptionPlan {
  interval: 'day' | 'week' | 'month' | 'year'; // required
  frequency: number; // required
  trial?: number;
  plans?: {
    id: string;
    platform: string;
    status: string;
  }[];
}

export interface Image {
  fileId: string;
  url: string;
  alt?: string | null;
}

export interface DownloadFile {
  name: string;
  url: string;
  id: string;
}
