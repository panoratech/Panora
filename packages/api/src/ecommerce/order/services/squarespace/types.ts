export interface SquarespaceOrderInput {
  id: string;
  orderNumber: string;
  createdOn: string;
  modifiedOn: string;
  channel: string;
  testmode: boolean;
  customerEmail: string;
  billingAddress: Address;
  shippingAddress: Address;
  fulfillmentStatus: 'PENDING' | 'FULFILLED' | 'CANCELED';
  lineItems: LineItem[];
  internalNotes: InternalNote[];
  shippingLines: ShippingLine[];
  discountLines: DiscountLine[];
  formSubmission: { label: string; value: string }[];
  fulfillments: Fulfillment[];
  subtotal: TotalAmount;
  shippingTotal: TotalAmount;
  discountTotal: TotalAmount;
  taxTotal: TotalAmount;
  refundedTotal: TotalAmount;
  grandTotal: TotalAmount;
  channelName: string;
  externalOrderReference: string;
  fulfilledOn: string;
  priceTaxInterpretation: 'EXCLUSIVE' | 'INCLUSIVE';
}

export type SquarespaceOrderOutput = Partial<SquarespaceOrderInput>;

type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  countryCode: string;
  postalCode: string;
  phone: string;
};

type UnitPrice = {
  value: string;
  currency: string;
};

type LineItemVariantOption = {
  value: string;
  optionName: string;
};

type LineItemCustomization = {
  label: string;
  value: string;
};

type LineItem = {
  id: string;
  variantId: string;
  sku: string | null;
  weight: number;
  width: number;
  length: number;
  height: number;
  productId: string;
  productName: string;
  quantity: number;
  unitPricePaid: UnitPrice;
  variantOptions: LineItemVariantOption[] | null;
  customizations: LineItemCustomization[] | null;
  imageUrl: string;
  lineItemType: string;
};

type InternalNote = {
  content: string;
};

type ShippingLine = {
  method: string;
  amount: UnitPrice;
};

type DiscountLine = {
  description: string;
  name: string;
  amount: UnitPrice;
  promoCode: string;
};

type Fulfillment = {
  shipDate: string;
  carrierName: string;
  service: string;
  trackingNumber: string;
  trackingUrl: string;
};

type TotalAmount = {
  value: string;
  currency: string;
};
