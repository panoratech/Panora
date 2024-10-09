// ref: https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems

export interface EbayProductOutput {
  sku: string;
  availability?: AvailabilityWithAll;
  condition?: ConditionEnum;
  conditionDescription?: string;
  conditionDescriptors?: ConditionDescriptor[];
  groupIds?: string[];
  inventoryItemGroupKeys?: string[];
  packageWeightAndSize?: PackageWeightAndSize;
  product?: EbayProduct;
}

export interface AvailabilityWithAll {
  pickupAtLocationAvailability?: PickupAtLocationAvailability[];
  shipToLocationAvailability?: ShipToLocationAvailabilityWithAll;
}

export interface PickupAtLocationAvailability {
  availabilityType?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SHIP_TO_STORE';
  fulfillmentTime?: TimeDuration;
  quantity?: number;
}

export interface ShipToLocationAvailabilityWithAll {
  allocationByFormat?: FormatAllocation;
  availabilityDistributions?: AvailabilityDistribution[];
  quantity?: number;
}

export interface FormatAllocation {
  auction?: number;
  fixedPrice?: number;
}

export interface AvailabilityDistribution {
  fulfillmentTime?: TimeDuration;
  quantity?: number;
}

export interface TimeDuration {
  unit?: TimeDurationUnitEnum;
  value?: number;
}

export enum TimeDurationUnitEnum {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
  HOUR = 'HOUR',
  CALENDAR_DAY = 'CALENDAR_DAY',
  BUSINESS_DAY = 'BUSINESS_DAY',
  MINUTE = 'MINUTE',
  SECOND = 'SECOND',
  MILLISECOND = 'MILLISECOND',
}

export interface ConditionDescriptor {
  additionalInfo?: string;
  name: string;
  values: string[];
}

export enum ConditionEnum {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  NEW_OTHER = 'NEW_OTHER',
  NEW_WITH_DEFECTS = 'NEW_WITH_DEFECTS',
  MANUFACTURER_REFURBISHED = 'MANUFACTURER_REFURBISHED',
  CERTIFIED_REFURBISHED = 'CERTIFIED_REFURBISHED',
  EXCELLENT_REFURBISHED = 'EXCELLENT_REFURBISHED',
  VERY_GOOD_REFURBISHED = 'VERY_GOOD_REFURBISHED',
  GOOD_REFURBISHED = 'GOOD_REFURBISHED',
  SELLER_REFURBISHED = 'SELLER_REFURBISHED',
  USED_EXCELLENT = 'USED_EXCELLENT',
  USED_VERY_GOOD = 'USED_VERY_GOOD',
  USED_GOOD = 'USED_GOOD',
  USED_ACCEPTABLE = 'USER_ACCEPTABLE',
  FOR_PARTS_OR_NOT_WORKING = 'FOR_PARTS_OR_NOT_WORKING',
}

export interface PackageWeightAndSize {
  dimensions?: Dimension;
  packageType?: PackageTypeEnum;
  shippingIrregular?: boolean;
  weight?: Weight;
}

export interface Dimension {
  height: number;
  length: number;
  unit: LengthUnitOfMeasureEnum;
  width: number;
}

export enum LengthUnitOfMeasureEnum {
  INCH = 'INCH',
  FEET = 'FEET',
  METER = 'METER',
  CENTIMETER = 'CENTIMETER',
}

export enum PackageTypeEnum {
  LETTER = 'LETTER',
  BULKY_GOODS = 'BULKY_GOODS',
  CARAVAN = 'CARAVAN',
  CARS = 'CARS',
  EUROPALLET = 'EUROPALLET',
  EXPANDABLE_TOUGH_BAGS = 'EXPANDABLE_TOUGH_BAGS',
  EXTRA_LARGE_PACK = 'EXTRA_LARGE_PACK',
  FURNITURE = 'FURNITURE',
  INDUSTRY_VEHICLES = 'INDUSTRY_VEHICLES',
  LARGE_CANADA_POSTBOX = 'LARGE_CANADA_POSTBOX',
  LARGE_CANADA_POST_BUBBLE_MAILER = 'LARGE_CANADA_POST_BUBBLE_MAILER',
  LARGE_ENVELOPE = 'LARGE_ENVELOPE',
  MAILING_BOX = 'MAILING_BOX',
  MEDIUM_CANADA_POST_BOX = 'MEDIUM_CANADA_POST_BOX',
  MEDIUM_CANADA_POST_BUBBLE_MAILER = 'MEDIUM_CANADA_POST_BUBBLE_MAILER',
  MOTORBIKES = 'MOTORBIKES',
  ONE_WAY_PALLET = 'ONE_WAY_PALLET',
  PACKAGE_THICK_ENVELOPE = 'PACKAGE_THICK_ENVELOPE',
  PADDED_BAGS = 'PADDED_BAGS',
  PARCEL_OR_PADDED_ENVELOPE = 'PARCEL_OR_PADDED_ENVELOPE',
  ROLL = 'ROLL',
  SMALL_CANADA_POST_BOX = 'SMALL_CANADA_POST_BOX',
  SMALL_CANADA_POST_BUBBLE_MAILER = 'SMALL_CANADA_POST_BUBBLE_MAILER',
  TOUGH_BAGS = 'TOUGH_BAGS',
  UPS_LETTER = 'UPS_LETTER',
  USPS_FLAT_RATE_ENVELOPE = 'USPS_FLAT_RATE_ENVELOPE',
  USPS_LARGE_PACK = 'USPS_LARGE_PACK',
  VERY_LARGE_PACK = 'VERY_LARGE_PACK',
  WINE_PAK = 'WINE_PAK',
}

export interface Weight {
  value: number;
  unit: WeightUnitOfMeasureEnum;
}

export enum WeightUnitOfMeasureEnum {
  POUND = 'POUND',
  OUNCE = 'OUNCE',
  KILOGRAM = 'KILOGRAM',
  GRAM = 'GRAM',
}

export interface EbayProduct {
  aspects?: Record<string, string>;
  brand?: string;
  description: string;
  ean?: string[];
  epid?: string; // eBay Product Identifier
  imageUrls?: string[];
  isbn?: string[];
  mpn?: string;
  subtitle?: string;
  title: string;
  upc?: string[];
  videoIds?: string[];
}

// ref: https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
export type EbayProductInput = EbayProductOutput;
