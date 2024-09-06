import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { ShopifyOrderOutput } from './types';
import { OriginalOrderOutput } from '@@core/utils/types/original/original.ecommerce';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class ShopifyOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'order', 'shopify', this);
  }
  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyOrderOutput> {
    return {
      line_items: source.items.map((item) => ({
        title: item.title,
        price: item.price,
        grams: item.weight,
        quantity: item.quantity,
        sku: item.sku,
        variant_title: item.variant_title,
        vendor: item.vendor,
        tax_lines: item.tax_lines /* 
        {"price":13.5,"rate":0.06,"title":"State tax"}]}
        */,
      })),
      /*transactions: [
        {
          kind: 'sale',
          status: 'success',
          amount: 238.47,
        },
      ],*/
      total_tax: source.total_tax,
      currency: source.currency,
    };
  }

  async unify(
    source: ShopifyOrderOutput | ShopifyOrderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput | UnifiedEcommerceOrderOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleOrderToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyOrderOutput
    return Promise.all(
      source.map((order) =>
        this.mapSingleOrderToUnified(order, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleOrderToUnified(
    order: ShopifyOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const opts: any = {};
    if (order.customer && order.customer.id) {
      const customer_id = await this.utils.getCustomerIdFromRemote(
        String(order.customer.id),
        connectionId,
      );
      if (customer_id) {
        opts.customer_id = customer_id;
      }
    }
    return {
      remote_id: order.id?.toString(),
      remote_data: order,
      order_status: order.fulfillment_status || order.financial_status || '',
      order_number: order.order_number?.toString() || '',
      payment_status: order.financial_status || '',
      currency: (order.currency as CurrencyCode) || null,
      total_price: parseFloat(order.total_price || '0'),
      total_discount: parseFloat(order.total_discounts || '0'),
      total_shipping: order.shipping_lines?.reduce(
        (sum, line) => sum + parseFloat(line.price || '0'),
        0,
      ),
      ...opts,
      total_tax: parseFloat((order.total_tax as string) || '0'),
      fulfillment_status: order.fulfillment_status || '',
      field_mappings: customFieldMappings?.reduce(
        (acc, mapping) => ({
          ...acc,
          [mapping.slug]: order[mapping.remote_id],
        }),
        {},
      ),
    };
  }
}
