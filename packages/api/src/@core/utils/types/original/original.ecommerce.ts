/* INPUT */

import {
  ShopifyCustomerInput,
  ShopifyCustomerOutput,
} from '@ecommerce/customer/services/shopify/types';
import {
  ShopifyFulfillmentInput,
  ShopifyFulfillmentOutput,
} from '@ecommerce/fulfillment/services/shopify/types';
import {
  ShopifyFulfillmentOrdersInput,
  ShopifyFulfillmentOrdersOutput,
} from '@ecommerce/fulfillmentorders/services/shopify/types';
import {
  ShopifyOrderInput,
  ShopifyOrderOutput,
} from '@ecommerce/order/services/shopify/types';
import {
  ShopifyProductInput,
  ShopifyProductOutput,
} from '@ecommerce/product/services/shopify/types';

/* product */
export type OriginalProductInput = ShopifyProductInput;

/* order */
export type OriginalOrderInput = ShopifyOrderInput;

/* fulfillmentorders */
export type OriginalFulfillmentOrdersInput = ShopifyFulfillmentOrdersInput;

/* customer */
export type OriginalCustomerInput = ShopifyCustomerInput;

/* fulfillment */
export type OriginalFulfillmentInput = ShopifyFulfillmentInput;

export type EcommerceObjectInput =
  | OriginalProductInput
  | OriginalOrderInput
  | OriginalFulfillmentOrdersInput
  | OriginalCustomerInput
  | OriginalFulfillmentInput;

/* OUTPUT */

/* product */
export type OriginalProductOutput = ShopifyProductOutput;

/* order */
export type OriginalOrderOutput = ShopifyOrderOutput;

/* fulfillmentorders */
export type OriginalFulfillmentOrdersOutput = ShopifyFulfillmentOrdersOutput;

/* customer */
export type OriginalCustomerOutput = ShopifyCustomerOutput;

/* fulfillment */
export type OriginalFulfillmentOutput = ShopifyFulfillmentOutput;

export type EcommerceObjectOutput =
  | OriginalProductOutput
  | OriginalOrderOutput
  | OriginalFulfillmentOrdersOutput
  | OriginalCustomerOutput
  | OriginalFulfillmentOutput;
