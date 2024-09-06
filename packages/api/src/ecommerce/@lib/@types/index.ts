import { ICustomerService } from '@ecommerce/customer/types';
import {
  UnifiedEcommerceCustomerInput,
  UnifiedEcommerceCustomerOutput,
} from '@ecommerce/customer/types/model.unified';
import { IFulfillmentService } from '@ecommerce/fulfillment/types';
import {
  UnifiedEcommerceFulfillmentInput,
  UnifiedEcommerceFulfillmentOutput,
} from '@ecommerce/fulfillment/types/model.unified';
import { IFulfillmentOrdersService } from '@ecommerce/fulfillmentorders/types';
import {
  UnifiedEcommerceFulfillmentOrdersInput,
  UnifiedEcommerceFulfillmentOrdersOutput,
} from '@ecommerce/fulfillmentorders/types/model.unified';
import { IOrderService } from '@ecommerce/order/types';
import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IProductService } from '@ecommerce/product/types';
import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '@ecommerce/product/types/model.unified';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export type UnifiedEcommerce =
  | UnifiedEcommerceOrderInput
  | UnifiedEcommerceOrderOutput
  | UnifiedEcommerceCustomerInput
  | UnifiedEcommerceCustomerOutput
  | UnifiedEcommerceFulfillmentInput
  | UnifiedEcommerceFulfillmentOutput
  | UnifiedEcommerceFulfillmentOrdersInput
  | UnifiedEcommerceFulfillmentOrdersOutput
  | UnifiedEcommerceProductInput
  | UnifiedEcommerceProductOutput;

export type IEcommerceService =
  | IProductService
  | IOrderService
  | IFulfillmentService
  | IFulfillmentOrdersService
  | ICustomerService;

export enum EcommerceObject {
  fulfillment = 'fulfillment',
  customer = 'customer',
  order = 'order',
  fulfillmentorder = 'fulfillmentorder',
  product = 'product',
}

export class Address {
  @ApiProperty({
    type: String,
    example: '5th Avenue',
    description: 'The street',
  })
  @IsString()
  street_1: string;

  @ApiProperty({
    type: String,
    example: 'Street 2',
    description: 'More information about the street ',
  })
  @IsString()
  @IsOptional()
  street_2?: string;

  @ApiProperty({
    type: String,
    example: 'New York',
    description: 'The city',
  })
  @IsString()
  city: string;

  @ApiProperty({
    type: String,
    example: 'New York',
    nullable: true,
    description: 'The state',
  })
  @IsString()
  state: string;

  @ApiProperty({
    type: String,
    example: '10001',
    nullable: true,
    description: 'The postal code',
  })
  @IsString()
  postal_code: string;

  @ApiProperty({
    type: String,
    example: 'United States of America',
    nullable: true,
    description: 'The country',
  })
  @IsString()
  country: string;

  @ApiProperty({
    type: String,
    //enum: ['SHIPPING', 'BILLING'],
    example: 'SHIPPING',
    nullable: true,
    description:
      'The address type. Authorized values are either SHIPPING or BILLING.',
  })
  ////@IsIn(['SHIPPING', 'BILLING'])
  @IsOptional()
  @IsString()
  address_type?: 'SHIPPING' | 'BILLING' | string;
}
