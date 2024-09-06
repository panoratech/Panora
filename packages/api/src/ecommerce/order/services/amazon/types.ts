export type AmazonOrderInput = {
  AmazonOrderId: string;
  PurchaseDate: string; // ISO 8601 date string
  LastUpdateDate: string; // ISO 8601 date string
  OrderStatus: string;
  FulfillmentChannel: string;
  NumberOfItemsShipped: number;
  NumberOfItemsUnshipped: number;
  PaymentMethod: string;
  PaymentMethodDetails: string[]; // Array of payment method details
  MarketplaceId: string;
  ShipmentServiceLevelCategory: string;
  OrderType: string;
  EarliestShipDate: string; // ISO 8601 date string
  LatestShipDate: string; // ISO 8601 date string
  IsBusinessOrder: boolean;
  IsPrime: boolean;
  IsAccessPointOrder: boolean;
  IsGlobalExpressEnabled: boolean;
  IsPremiumOrder: boolean;
  IsSoldByAB: boolean;
  IsIBA: boolean;
  ShippingAddress: ShippingAddress;
  BuyerInfo: BuyerInfo;
  OrderTotal: {
    CurrencyCode: string;
    Amount: string;
  };
} & {
  LineItems: OrderItem[];
};

export type AmazonOrderOutput = Partial<AmazonOrderInput>;

type ShippingAddress = {
  Name: string;
  AddressLine1: string;
  City: string;
  StateOrRegion: string;
  PostalCode: string;
  CountryCode: string;
};

type BuyerTaxInfo = {
  CompanyLegalName: string;
};

type BuyerInfo = {
  BuyerEmail: string;
  BuyerName: string;
  BuyerTaxInfo: BuyerTaxInfo;
  PurchaseOrderNumber: string;
};

type Money = {
  CurrencyCode: string; // ISO 4217 currency code
  Amount: string; // Monetary amount
};

type AssociatedItem = {
  ASIN: string;
  Title: string;
};

type ProductInfoDetail = {
  NumberOfItems: string;
};

type PointsGrantedDetail = {
  PointsNumber: number;
  PointsMonetaryValue: Money;
};

type TaxCollection = {
  Model: 'MarketplaceFacilitator';
  ResponsibleParty: 'Amazon Services, Inc.';
};

type ItemBuyerInfo = {
  BuyerCustomizedInfo: {
    CustomizedURL: string;
  };
  GiftWrapPrice: Money;
  GiftWrapTax: Money;
  GiftMessageText: string;
  GiftWrapLevel: string;
};

type BuyerRequestedCancel = {
  IsBuyerRequestedCancel: boolean;
  BuyerCancelReason: string;
};

type SubstitutionPreferences = {
  SubstitutionType:
    | 'CUSTOMER_PREFERENCE'
    | 'AMAZON_RECOMMENDED'
    | 'DO_NOT_SUBSTITUTE';
  SubstitutionOptions: {
    ASIN: string;
    QuantityOrdered: number;
    SellerSKU: string;
    Title: string;
    Measurement: Measurement;
  }[];
};

type Measurement = {
  Unit: string;
  Value: number;
};

type ShippingConstraints = {
  PalletDelivery: 'MANDATORY';
};

export type OrderItem = {
  ASIN: string; // The Amazon Standard Identification Number (ASIN) of the item.
  SellerSKU?: string; // The seller stock keeping unit (SKU) of the item.
  OrderItemId: string; // An Amazon-defined order item identifier.
  AssociatedItems?: AssociatedItem[]; // A list of associated items purchased with a product.
  Title?: string; // The name of the item.
  QuantityOrdered: number; // The number of items in the order.
  QuantityShipped?: number; // The number of items shipped.
  ProductInfo?: ProductInfoDetail; // Product information for the item.
  PointsGranted?: PointsGrantedDetail; // Amazon Points granted with the purchase.
  ItemPrice?: Money; // The selling price of the order item.
  ShippingPrice?: Money; // The shipping price of the item.
  ItemTax?: Money; // The tax on the item price.
  ShippingTax?: Money; // The tax on the shipping price.
  ShippingDiscount?: Money; // The discount on the shipping price.
  ShippingDiscountTax?: Money; // The tax on the discount on the shipping price.
  PromotionDiscount?: Money; // The total of all promotional discounts.
  PromotionDiscountTax?: Money; // The tax on the total of all promotional discounts.
  PromotionIds?: string[]; // A list of promotion identifiers.
  CODFee?: Money; // The fee charged for COD service.
  CODFeeDiscount?: Money; // The discount on the COD fee.
  IsGift?: boolean; // Indicates whether the item is a gift.
  ConditionNote?: string; // The condition of the item as described by the seller.
  ConditionId?:
    | 'New'
    | 'Used'
    | 'Collectible'
    | 'Refurbished'
    | 'Preorder'
    | 'Club'; // The condition of the item.
  ConditionSubtypeId?:
    | 'New'
    | 'Mint'
    | 'Very Good'
    | 'Good'
    | 'Acceptable'
    | 'Poor'
    | 'Club'
    | 'OEM'
    | 'Warranty'
    | 'Refurbished Warranty'
    | 'Refurbished'
    | 'Open Box'
    | 'Any'
    | 'Other'; // The subcondition of the item.
  ScheduledDeliveryStartDate?: string; // The start date of the scheduled delivery window.
  ScheduledDeliveryEndDate?: string; // The end date of the scheduled delivery window.
  PriceDesignation?: 'BusinessPrice'; // Indicates a special price for Amazon Business orders.
  TaxCollection?: TaxCollection; // Information about withheld taxes.
  SerialNumberRequired?: boolean; // Indicates if the product type has a serial number.
  IsTransparency?: boolean; // Indicates if the ASIN is enrolled in Transparency.
  IossNumber?: string; // The IOSS number for the marketplace.
  StoreChainStoreId?: string; // The store chain store identifier.
  DeemedResellerCategory?: string; // The category of deemed reseller.
  BuyerInfo?: ItemBuyerInfo; // A single item's buyer information.
  BuyerRequestedCancel?: BuyerRequestedCancel; // Information about buyer requested cancellation.
  SerialNumbers?: string[]; // A list of serial numbers for electronic products.
  SubstitutionPreferences?: SubstitutionPreferences; // Substitution preferences for the order item.
  Measurement?: Measurement; // Measurement information for the order item.
  ShippingConstraints?: ShippingConstraints; // Shipping constraints applicable to this order.
};
