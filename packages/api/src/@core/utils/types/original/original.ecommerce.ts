/* INPUT */

import {
  ShopifyCustomerInput,
  ShopifyCustomerOutput,
} from '@ecommerce/customer/services/shopify/types';
import {
  SquarespaceCustomerInput,
  SquarespaceCustomerOutput,
} from '@ecommerce/customer/services/squarespace/types';
import {
  WoocommerceCustomerInput,
  WoocommerceCustomerOutput,
} from '@ecommerce/customer/services/woocommerce/types';
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
  SquarespaceOrderInput,
  SquarespaceOrderOutput,
} from '@ecommerce/order/services/squarespace/types';
import {
  WoocommerceOrderInput,
  WoocommerceOrderOutput,
} from '@ecommerce/order/services/woocommerce/types';
import {
  ShopifyProductInput,
  ShopifyProductOutput,
} from '@ecommerce/product/services/shopify/types';
import {
  SquarespaceProductInput,
  SquarespaceProductOutput,
} from '@ecommerce/product/services/squarespace/types';
import {
  WoocommerceProductInput,
  WoocommerceProductOutput,
} from '@ecommerce/product/services/woocommerce/types';

/* product */
export type OriginalProductInput =
  | ShopifyProductInput
  | WoocommerceProductInput
  | SquarespaceProductInput;

/* order */
export type OriginalOrderInput =
  | ShopifyOrderInput
  | WoocommerceOrderInput
  | SquarespaceOrderInput;

/* fulfillmentorders */
export type OriginalFulfillmentOrdersInput = ShopifyFulfillmentOrdersInput;

/* customer */
export type OriginalCustomerInput =
  | ShopifyCustomerInput
  | WoocommerceCustomerInput
  | SquarespaceCustomerInput;

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
export type OriginalProductOutput =
  | ShopifyProductOutput
  | WoocommerceProductOutput
  | SquarespaceProductOutput;

/* order */
export type OriginalOrderOutput =
  | ShopifyOrderOutput
  | WoocommerceOrderOutput
  | SquarespaceOrderOutput;

/* fulfillmentorders */
export type OriginalFulfillmentOrdersOutput = ShopifyFulfillmentOrdersOutput;

/* customer */
export type OriginalCustomerOutput =
  | ShopifyCustomerOutput
  | WoocommerceCustomerOutput
  | SquarespaceCustomerOutput;

/* fulfillment */
export type OriginalFulfillmentOutput = ShopifyFulfillmentOutput;

export type EcommerceObjectOutput =
  | OriginalProductOutput
  | OriginalOrderOutput
  | OriginalFulfillmentOrdersOutput
  | OriginalCustomerOutput
  | OriginalFulfillmentOutput;
