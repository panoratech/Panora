import { ICustomerService } from '@ecommerce/customer/types';
import {
  UnifiedCustomerInput,
  UnifiedCustomerOutput,
} from '@ecommerce/customer/types/model.unified';
import { IFulfillmentService } from '@ecommerce/fulfillment/types';
import {
  UnifiedFulfilmentInput,
  UnifiedFulfilmentOutput,
} from '@ecommerce/fulfillment/types/model.unified';
import { IFulfillmentOrdersService } from '@ecommerce/fulfillmentorders/types';
import {
  UnifiedFulfillmentOrdersInput,
  UnifiedFulfillmentOrdersOutput,
} from '@ecommerce/fulfillmentorders/types/model.unified';
import { IOrderService } from '@ecommerce/order/types';
import {
  UnifiedOrderInput,
  UnifiedOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IProductService } from '@ecommerce/product/types';
import {
  UnifiedProductInput,
  UnifiedProductOutput,
} from '@ecommerce/product/types/model.unified';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export type UnifiedEcommerce =
  | UnifiedOrderInput
  | UnifiedOrderOutput
  | UnifiedCustomerInput
  | UnifiedCustomerOutput
  | UnifiedFulfilmentInput
  | UnifiedFulfilmentOutput
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

export class Address {
  @ApiProperty({
    type: String,
    description: 'The street',
  })
  @IsString()
  street_1: string;

  @ApiProperty({
    type: String,
    description: 'More information about the street ',
  })
  @IsString()
  @IsOptional()
  street_2?: string;

  @ApiProperty({
    type: String,
    description: 'The city',
  })
  @IsString()
  city: string;

  @ApiProperty({
    type: String,
    description: 'The state',
  })
  @IsString()
  state: string;

  @ApiProperty({
    type: String,
    description: 'The postal code',
  })
  @IsString()
  postal_code: string;

  @ApiProperty({
    type: String,
    description: 'The country',
  })
  @IsString()
  country: string;

  @ApiProperty({
    type: String,
    description:
      'The address type. Authorized values are either PERSONAL or WORK.',
  })
  @IsIn(['PERSONAL', 'WORK'])
  @IsOptional()
  @IsString()
  address_type?: string;
}
