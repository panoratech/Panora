import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import {
  EbayOrderInput,
  EbayOrderOutput,
  LineItemFulfillmentStatusEnum,
  OrderFulfillmentStatus,
  OrderPaymentStatusEnum,
} from './types';

@Injectable()
export class EbayOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'order', 'ebay', this);
  }

  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<EbayOrderInput> {
    const result: Partial<EbayOrderInput> = {
      orderFulfillmentStatus:
        source.fulfillment_status as OrderFulfillmentStatus,
      orderPaymentStatus: source.payment_status as OrderPaymentStatusEnum,
      pricingSummary: {
        priceSubtotal: {
          currency: source.currency,
          value: source.total_price.toString(),
        },
        priceDiscount: {
          currency: source.currency,
          value: source.total_discount.toString(),
        },
        deliveryCost: {
          currency: source.currency,
          value: source.total_shipping.toString(),
        },
        tax: {
          currency: source.currency,
          value: source.total_tax.toString(),
        },
        total: {
          currency: source.currency,
          value: source.total_price.toString(),
        },
      },
      lineItems: source.items.map((item) => ({
        lineItemId: item.remote_id.toString(),
        quantity: item.quantity,
        title: item.title,
        lineItemCost: {
          currency: source.currency,
          value: item.price.toString(),
        },
        total: {
          currency: source.currency,
          value: item.total.toString(),
        },
        lineItemFulfillmentStatus:
          item.fulfillment_status as LineItemFulfillmentStatusEnum,
        sku: item.sku,
      })),
    };
    return result;
  }

  async unify(
    source: EbayOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const result: UnifiedEcommerceOrderOutput = {
      remote_id: source.orderId.toString(),
      remote_data: source,
      order_status: source.orderFulfillmentStatus,
      payment_status: source.orderPaymentStatus,
      currency: source.pricingSummary.total.currency,
      total_price: Number(source.pricingSummary.total.value),
      total_discount: Number(source.pricingSummary.priceDiscount.value),
      total_shipping: Number(source.pricingSummary.deliveryCost.value),
      total_tax: Number(source.pricingSummary.tax.value),
      fulfillment_status: source.orderFulfillmentStatus,
      items: source.lineItems.map((item) => ({
        remote_id: item.lineItemId,
        sku: item.sku,
        quantity: item.quantity,
        title: item.title,
        price: item.lineItemCost.value,
        total: item.total.value,
        fulfillment_status: item.lineItemFulfillmentStatus,
      })),
      field_mappings: {},
    };

    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        result.field_mappings[mapping.slug] = source[mapping.remote_id];
      }
    }

    return result;
  }
}
