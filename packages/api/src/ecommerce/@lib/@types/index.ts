import { IProductService } from '@ecommerce/product/types';

export type UnifiedEcommerce =
  | UnifiedOrderInput
  | UnifiedOrderOutput
  | UnifiedCustomerInput
  | UnifiedCustomerOutput
  | UnifiedFulfillmentInput
  | UnifiedFulfillmentOutput
  | UnifiedFulfillmentOrdersInput
  | UnifiedFulfillmentOrdersOutput
  | UnifiedProductInput
  | UnifiedProductOutput;

export type IEcommerceService =
  | IProductService
  | IOrderService
  | IFulfillmentService
  | IFulfillmentOrdersService
  | ICustomerService;
