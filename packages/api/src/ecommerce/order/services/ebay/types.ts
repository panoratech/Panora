import { CurrencyCode } from '@@core/utils/types';

// ref: https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
export interface EbayOrderOutput {
  orderId: string;
  legacyOrderId?: string;
  creationDate: string;
  lastModifiedDate: string;
  orderFulfillmentStatus: OrderFulfillmentStatus;
  orderPaymentStatus: OrderPaymentStatusEnum;
  sellerId?: string;
  buyer?: {
    username?: string;
    taxAddress?: TaxAddress;
    taxIdentifier?: TaxIdentifier;
    buyerRegistrationAddress?: BuyerRegistrationAddress;
  };
  buyerCheckoutNotes?: string;
  pricingSummary: PricingSummary;
  cancelStatus?: CancelStatus;
  paymentSummary?: PaymentSummary;
  fulfillmentStartInstructions?: FulfillmentStartInstruction[];
  salesRecordReference?: string;
  fulfillmentHrefs?: string[];
  lineItems: LineItem[];
  ebayCollectAndRemitTax?: boolean;
  salesTaxAmount?: Amount;
  totalFeeBasisAmount?: Amount;
  totalMarketplaceFee?: Amount;
}

type Amount = {
  currency: CurrencyCode;
  value: string;
  convertedFromCurrency?: CurrencyCode;
  convertedFromValue?: string;
};

type TaxAddress = {
  city?: string;
  countryCode?: string;
  postalCode?: string;
  stateOrProvince?: string;
};

type TaxIdentifier = {
  taxpayerId?: string;
  taxIdentifierType?: TaxIdentifierTypeEnum;
  issuingCountry?: string;
};

type ContactAddress = {
  addressLine1?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode?: string;
};

type BuyerRegistrationAddress = {
  fullName?: string;
  contactAddress?: ContactAddress;
  primaryPhone?: {
    phoneNumber?: string;
  };
  email?: string;
};

type PricingSummary = {
  priceSubtotal: Amount;
  priceDiscount?: Amount;
  deliveryCost?: Amount;
  deliveryDiscount?: Amount;
  tax?: Amount;
  total: Amount;
  totalTaxAmount?: Amount;
};

type CancelRequest = {
  cancelRequestId: string;
  cancelCompletedDate?: string;
  cancelRequestState: CancelRequestStateEnum;
  cancelRequestedDate?: string;
  cancelReason?: string;
  cancelInitiator?: string;
};

type CancelStatus = {
  cancelState: CancelStateEnum;
  cancelRequests?: CancelRequest[];
};

type Refund = {
  refundId?: string;
  refundAmount: Amount;
  refundDate?: string;
  refundReferenceId?: string;
  refundStatus?: RefundStatusEnum;
};

type PaymentHold = {
  expectedReleaseDate?: string;
  holdReason?: string;
  holdAmount?: Amount;
  holdState?: string;
  releaseDate?: string;
  sellerActionsToRelease?: Array<{
    sellerActionToRelease?: string;
  }>;
};

type Payment = {
  paymentMethod?: PaymentMethodTypeEnum;
  paymentReferenceId?: string;
  paymentAmount: Amount;
  paymentStatus?: PaymentStatusEnum;
  paymentDate?: string;
  paymentHolds?: PaymentHold[];
};

type PaymentSummary = {
  totalDueSeller: Amount;
  refunds?: Refund[];
  payments?: Payment[];
};

type ShippingStep = {
  shipToReferenceId?: string;
  shippingCarrierCode?: string;
  shippingServiceCode?: string;
  shipTo?: {
    fullName?: string;
    contactAddress?: ContactAddress;
    primaryPhone?: {
      phoneNumber?: string;
    };
    email?: string;
  };
};

type FinalDestinationAddress = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode?: string;
};

type FulfillmentStartInstruction = {
  fulfillmentInstructionsType: FulfillmentInstructionsType;
  minEstimatedDeliveryDate?: string;
  maxEstimatedDeliveryDate?: string;
  ebaySupportedFulfillment?: boolean;
  shippingStep?: ShippingStep;
  pickupStep?: {
    merchantLocationKey: string;
  };
  finalDestinationAddress?: FinalDestinationAddress;
};

type LineItem = {
  lineItemId: string;
  legacyItemId?: string;
  legacyVariationId?: string;
  sku?: string;
  title?: string;
  lineItemCost: Amount;
  quantity: number;
  soldFormat?: SoldFormatEnum;
  listingMarketplaceId?: string;
  purchaseMarketplaceId?: string;
  lineItemFulfillmentStatus?: LineItemFulfillmentStatusEnum;
  total: Amount;
  deliveryCost?: {
    shippingCost?: Amount;
    handlingCost?: Amount;
    importCharges?: Amount;
    shippingIntermediationFee?: Amount;
  };
  appliedPromotions?: Array<{
    promotionId?: string;
    description?: string;
    discountAmount?: Amount;
  }>;
  taxes?: Array<{
    taxType?: TaxTypeEnum;
    amount: Amount;
  }>;
  ebayCollectAndRemitTaxes?: Array<{
    taxType?: TaxTypeEnum;
    amount: Amount;
    collectionMethod?: string;
  }>;
  properties?: {
    buyerProtection?: boolean;
    fromBestOffer?: boolean;
    soldViaAdCampaign?: boolean;
  };
  lineItemFulfillmentInstructions?: {
    minEstimatedDeliveryDate?: string;
    maxEstimatedDeliveryDate?: string;
    shipByDate?: string;
    guaranteedDelivery?: boolean;
  };
  itemLocation?: {
    location?: string;
    countryCode?: string;
  };
  deliveryAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

enum TaxIdentifierTypeEnum {
  CODICE_FISCALE = 'CODICE_FISCALE',
  DNI = 'DNI',
  NIE = 'NIE',
  NIF = 'NIF',
  NIT = 'NIT',
  VATIN = 'VATIN',
}

enum CancelRequestStateEnum {
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  REQUESTED = 'REQUESTED',
}

enum CancelStateEnum {
  CANCELED = 'CANCELED',
  IN_PROGRESS = 'IN_PROGRESS',
  NONE_REQUESTED = 'NONE_REQUESTED',
}

enum FulfillmentInstructionsType {
  DIGITAL = 'DIGITAL',
  PREPARE_FOR_PICKUP = 'PREPARE_FOR_PICKUP',
  SELLER_DEFINED = 'SELLER_DEFINED',
  SHIP_TO = 'SHIP_TO',
  FULFILLED_BY_EBAY = 'FULFILLED_BY_EBAY',
}

enum TaxTypeEnum {
  STATE_SALES_TAX = 'STATE_SALES_TAX',
  PROVINCE_SALES_TAX = 'PROVINCE_SALES_TAX',
  REGION = 'REGION',
  VAT = 'VAT',
  GST = 'GST',
  ELECTRONIC_RECYCLING_FEE = 'ELECTRONIC_RECYCLING_FEE',
  MATTRESS_RECYCLING_FEE = 'MATTRESS_RECYCLING_FEE',
  ADDITIONAL_FEE = 'ADDITIONAL_FEE',
  BATTERY_RECYCLING_FEE = 'BATTERY_RECYCLING_FEE',
  TIRE_RECYCLING_FEE = 'TIRE_RECYCLING_FEE',
  WHITE_GOODS_DISPOSABLE_TAX = 'WHITE_GOODS_DISPOSABLE_TAX',
  IMPORT_VAT = 'IMPORT_VAT',
  SST = 'SST',
}

export enum LineItemFulfillmentStatusEnum {
  FULFILLED = 'FULFILLED',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_STARTED = 'NOT_STARTED',
}

export enum SoldFormatEnum {
  AUCTION = 'AUCTION',
  FIXED_PRICE = 'FIXED_PRICE',
  OTHER = 'OTHER',
  SECOND_CHANCE_OFFER = 'SECOND_CHANCE_OFFER',
}

export enum OrderFulfillmentStatus {
  FULFILLED = 'FULFILLED',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_STARTED = 'NOT_STARTED',
}

export enum OrderPaymentStatusEnum {
  FAILED = 'FAILED',
  FULLY_REFUNDED = 'FULLY_REFUNDED',
  PAID = 'PAID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  PENDING = 'PENDING',
}

enum PaymentMethodTypeEnum {
  CREDIT_CARD = 'CREDIT_CARD',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  SEPA = 'SEPA',
  CASH_ON_PICKUP = 'CASH_ON_PICKUP',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  PAYTM = 'PAYTM',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ESCROW = 'ESCROW',
  MONEY_ORDER = 'MONEY_ORDER',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  INTEGRATED_MERCHANT_CREDIT_CARD = 'INTEGRATED_MERCHANT_CREDIT_CARD',
  PERSONAL_CHECK = 'PERSONAL_CHECK',
  OTHER = 'OTHER',
}

enum PaymentStatusEnum {
  FAILED = 'FAILED',
  PAID = 'PAID',
  PENDING = 'PENDING',
}

enum RefundStatusEnum {
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  REFUNDED = 'REFUNDED',
}

export type EbayOrderInput = Partial<EbayOrderOutput>;
