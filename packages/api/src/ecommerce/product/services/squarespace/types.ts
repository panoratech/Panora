export interface SquarespaceProductInput {
  id: string; // Unique Product id
  type: 'PHYSICAL' | 'DIGITAL'; // Product type indicator
  storePageId: string; // Identifier of the product's Store Page
  name: string; // Product name
  description: string; // Long-form product description in HTML
  url: string; // Absolute URL of the product details page
  urlSlug: string; // URL slug for the product
  tags: string[]; // Keywords for search and organization
  isVisible: boolean; // Indicates if the product is available for purchase
  seoOptions: SeoOptions; // SEO options for the product
  variantAttributes: string[]; // List of attributes for variants
  variants: Variant[]; // List of variants of the product
  images: Image[]; // List of product images
  createdOn: string; // Date when the product was created
  modifiedOn: string; // Date when the product was last modified
}

export type SquarespaceProductOutput = Partial<SquarespaceProductInput>;

type Currency = {
  currency: string; // ISO 4217 currency code
  value: string; // Monetary amount
};

type Stock = {
  quantity: number; // Number of units available
  unlimited: boolean; // Indicates if stock is unlimited
};

type Weight = {
  unit: 'KILOGRAM' | 'POUND'; // Unit of measurement
  value: number; // Weight amount
};

type Dimensions = {
  unit: 'INCH' | 'CENTIMETER'; // Unit of measurement
  length: number; // Length of the variant
  width: number; // Width of the variant
  height: number; // Height of the variant
};

type ShippingMeasurements = {
  weight: Weight; // Weight of the variant
  dimensions: Dimensions; // Physical dimensions of the variant
};

type Image = {
  id: string; // Unique ProductImage id
  altText: string; // Alt text for the image
  url: string; // Absolute URL of the image
  originalSize: {
    width: number; // Width in pixels
    height: number; // Height in pixels
  };
  availableFormats: string[]; // Available image sizes
};

type Variant = {
  id: string; // Unique ProductVariant id
  sku: string; // Merchant-defined code for the variant
  pricing: {
    basePrice: Currency; // Pricing data for the variant
    salePrice: Currency; // Sale price if applicable
    onSale: boolean; // Indicates if the variant is on sale
  };
  stock: Stock; // Available stock for the variant
  attributes: Record<string, string>; // Attribute-value pairs for the variant
  shippingMeasurements: ShippingMeasurements; // Measurements of the variant
  image: Image; // Product image assigned to the variant
};

type SeoOptions = {
  title: string; // Page title for SEO
  description: string; // Page description for SEO
};
