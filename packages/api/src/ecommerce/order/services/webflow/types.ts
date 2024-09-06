import { CurrencyCode } from '@@core/utils/types';

export interface WebflowOrderInput {
  readonly orderId: string;
  status:
    | 'pending'
    | 'unfulfilled'
    | 'fulfilled'
    | 'disputed'
    | 'dispute-lost'
    | 'refunded';
  comment?: string | null; // A comment string for this Order, which is editable by API user (not used by Webflow).
  orderComment?: string | null; // A comment that the customer left when making their Order
  acceptedOn: string | null;
  fulfilledOn: string | null;
  refundedOn: string | null;
  disputedOn: string | null;
  disputeUpdatedOn: string | null;
  disputeLastStatus: DisputeStatus | null;
  customerPaid: Money;
  netAmount: Money;
  applicationFee: Money;
  allAddresses: Address[];
  shippingAddress: Address;
  shippingProvider?: string | null;
  shippingTracking?: string | null;
  shippingTrackingURL: string | null;
  customerInfo: {
    fullName: string;
    email: string;
  };
  purchasedItems: PurchasedItem[];
  purchasedItemsCount: number;
  stripeDetails: StripeDetails | null;
  stripeCard: StripeCard | null;
  paypalDetails: PaypalDetails | null;
  paymentProcessor?: string;
  customData: Array<Record<string, any>>; // Array of objects
  metadata: {
    isBuyNow: boolean;
    hasDownloads?: boolean;
    paymentProcessor?: string;
  };
  billingAddress: Address;
  totals?: Totals;
  isCustomerDeleted?: boolean;
  isShippingRequired: boolean;
  hasDownloads?: boolean;
  downloadFiles?: {
    id: string;
    name: string;
    url: string;
  }[];
}

interface Money {
  unit: CurrencyCode; // The three-letter ISO currency code
  value: number;
  string: string; // example: "$ 109.05 USD"
}

interface Address {
  type: 'billing' | 'shipping';
  japanType?: 'kana' | 'kanji' | null; // Represents a Japan-only address format. This field will only appear on orders placed from Japan.
  addressee: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface FileObjectVariant {
  url: string;
  originalFileName: string;
  size: number;
  width: number; // in pixels
  height: number; // in pixels
}

interface FileObject {
  size: number;
  originalFileName: string;
  createdOn: string;
  contentType: string; // The MIME type of the image
  width: number; // The image width in pixels
  height: number; // The image height in pixels
  variants: FileObjectVariant[];
}

interface PurchasedItem {
  count: number;
  rowTotal: Money;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  variantSlug: string;
  variantSKU: string;
  variantImage: {
    url: string;
    file: FileObject | null;
  };
  variantPrice: Money;
  weight: number | null;
  height: number | null;
  width: number | null;
  length: number | null;
}

interface StripeDetails {
  customerId: string | null;
  paymentMethod: string | null;
  chargeId: string | null;
  disputeId: string | null;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  refundId: string | null;
  refundReason: string | null;
}

interface PaypalDetails {
  orderId: string;
  payerId: string;
  captureId: string;
  refundId: string;
  refundReason: string;
  disputeId: string;
}

interface StripeCard {
  last4: string;
  brand: StripeCardBrands;
  ownerName: string;
  expires: {
    month: number;
    year: number;
  };
}

interface Totals {
  subtotal: Money;
  extras: {
    type: 'tax' | 'shipping' | 'discount' | 'discount-shipping';
    name: string;
    description?: string;
    price: Money;
  }[];
  total: Money;
}

enum DisputeStatus {
  WARNING_NEEDS_RESPONSE = 'warning_needs_response',
  WARNING_UNDER_REVIEW = 'warning_under_review',
  WARNING_CLOSED = 'warning_closed',
  NEEDS_RESPONSE = 'needs_response',
  UNDER_REVIEW = 'under_review',
  CHARGE_REFUNDED = 'charge_refunded',
  WON = 'won',
  LOST = 'lost',
}

enum StripeCardBrands {
  VISA = 'Visa',
  AMEX = 'American Express',
  MASTERCARD = 'MasterCard',
  DISCOVER = 'Discover',
  JCB = 'JCB',
  DINERS_CLUB = 'Diners Club',
  UNKNOWN = 'Unknown',
}

export type WebflowOrderOutput = Partial<WebflowOrderInput>;
