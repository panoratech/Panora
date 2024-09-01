import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { WebflowOrderInput, WebflowOrderOutput } from './types';

@Injectable()
export class WebflowOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'order', 'webflow', this);
  }

  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WebflowOrderInput> {
    return;
  }

  async unify(
    source: WebflowOrderOutput | WebflowOrderOutput[],
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
    return Promise.all(
      source.map((order) =>
        this.mapSingleOrderToUnified(order, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleOrderToUnified(
    source: WebflowOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const result: UnifiedEcommerceOrderOutput = {
      remote_id: source.orderId,
      remote_data: source,
      created_at: source.acceptedOn,
      order_status: this.mapWebflowStatusToUnified(source.status),
      currency: source.customerPaid.unit,
      total_price: source.totals.total.value,
      fulfillment_status: this.mapWebflowStatusToUnified(source.status),
      items:
        source.purchasedItems?.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          sku: item.variantSKU,
          title: item.productName,
          quantity: item.count,
          price: item.variantPrice.value.toString(),
          total: item.rowTotal.value.toString(),
          variant_title: item.variantName,
          weight: item.weight,
          properties: [
            {
              name: 'image_url',
              value: item.variantImage.url,
            },
          ],
        })) || [],
      field_mappings: {},
    };

    result.total_discount = source.totals.extras
      .filter((extra) => ['discount', 'discount-shipping'].includes(extra.type))
      .reduce((acc, curr) => acc + curr.price.value, 0);

    result.total_shipping = source.totals.extras
      .filter((extra) => extra.type === 'shipping')
      .reduce((acc, curr) => acc + curr.price.value, 0);

    result.total_tax = source.totals.extras
      .filter((extra) => extra.type === 'tax')
      .reduce((acc, curr) => acc + curr.price.value, 0);

    if (customFieldMappings && source.customData) {
      for (const [key, value] of Object.entries(source.customData)) {
        if (customFieldMappings.find((m) => m.slug === key)) {
          result.field_mappings[key] = value;
        }
      }
    }

    return result;
  }

  private mapWebflowStatusToUnified(
    status?: WebflowOrderInput['status'],
  ): string {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'fulfilled':
        return 'FULLFILLED';
      default:
        return status;
    }
  }
}
