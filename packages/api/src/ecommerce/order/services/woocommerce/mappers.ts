import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { WoocommerceOrderInput, WoocommerceOrderOutput } from './types';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class WoocommerceOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'order',
      'woocommerce',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WoocommerceOrderInput> {
    const result: Partial<WoocommerceOrderInput> = {
      status: this.mapUnifiedStatusToWooCommerce(source.order_status),
      currency: source.currency,
      total: source.total_price?.toString(),
      total_tax: source.total_tax?.toString(),
      customer_id: parseInt(source.customer_id || '0'),
      customer_note: '',
      billing: {} as any,
      shipping: {} as any,
      payment_method: '',
      payment_method_title: '',
      transaction_id: '',
      meta_data: [],
      line_items: [],
      shipping_lines: [],
      fee_lines: [],
      coupon_lines: [],
    };

    if (source.items) {
      result.line_items = Object.values(source.items).map((item) => ({
        name: item.title,
        product_id: 0, // You might need to map this from your unified model
        variation_id: 0, // You might need to map this from your unified model
        quantity: item.quantity,
        tax_class: '',
        subtotal: item.price.toString(),
        total: (parseFloat(item.price) * item.quantity).toString(),
        sku: item.sku,
      })) as any;
    }

    if (customFieldMappings && source.field_mappings) {
      result.meta_data = customFieldMappings.map((mapping) => ({
        id: 0, // WooCommerce will assign the actual ID
        key: mapping.slug,
        value: source.field_mappings[mapping.remote_id] || '',
      }));
    }

    return result as WoocommerceOrderInput;
  }

  async unify(
    source: WoocommerceOrderOutput | WoocommerceOrderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput | UnifiedEcommerceOrderOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleOrderToUnified(
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
    order: WoocommerceOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const result: UnifiedEcommerceOrderOutput = {
      remote_id: order.id?.toString(),
      remote_data: order,
      order_status: this.mapWooCommerceStatusToUnified(order.status),
      order_number: order.number,
      payment_status: order.status,
      currency: order.currency as CurrencyCode,
      total_price: parseFloat(order.total || '0'),
      total_discount: parseFloat(order.discount_total || '0'),
      total_shipping: parseFloat(order.shipping_total || '0'),
      total_tax: parseFloat(order.total_tax || '0'),
      fulfillment_status: order.status, // WooCommerce doesn't have a separate fulfillment status
      items: [],
      field_mappings: {},
    };
    if (order.customer_id) {
      result.customer_id = await this.utils.getCustomerIdFromRemote(
        String(order.customer_id),
        connectionId,
      );
    }

    if (order.line_items) {
      result.items = order.line_items.map((item) => ({
        remote_id: item.id,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
      }));
    }

    if (customFieldMappings && order.meta_data) {
      result.field_mappings = order.meta_data.reduce((acc, meta) => {
        const mapping = customFieldMappings.find((m) => m.slug === meta.key);
        if (mapping) {
          acc[mapping.remote_id] = meta.value;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    return result;
  }

  private mapUnifiedStatusToWooCommerce(
    status?: string,
  ): WoocommerceOrderInput['status'] {
    switch (status) {
      case 'PENDING':
        return 'pending';
      default:
        return status as WoocommerceOrderInput['status'];
    }
  }

  private mapWooCommerceStatusToUnified(
    status?: WoocommerceOrderInput['status'],
  ): string {
    switch (status) {
      case 'pending':
        return 'PENDING';
      default:
        return status;
    }
  }
}
