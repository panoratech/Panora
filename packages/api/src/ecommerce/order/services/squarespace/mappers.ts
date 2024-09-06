import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { SquarespaceOrderOutput, SquarespaceOrderInput } from './types';
import { CurrencyCode } from '@@core/utils/types';
import { EcommerceObject } from '@ecommerce/@lib/@types';
import { SquarespaceCustomerOutput } from '@ecommerce/customer/services/squarespace/types';
import { UnifiedEcommerceCustomerOutput } from '@ecommerce/customer/types/model.unified';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class SquarespaceOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'order',
      'squarespace',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SquarespaceOrderInput> {
    let opts: any = {};
    if (source.customer_id) {
      const customer = await this.utils.getCustomerFromUUID(source.customer_id);
      opts = {
        customerEmail: customer.email,
        /*billingAddress: customerAddress
          ? this.mapAddress(customerAddress)
          : undefined,
        shippingAddress: customerAddress
          ? this.mapAddress(customerAddress)
          : undefined,*/
      };
    }
    const result = {
      orderNumber: source.order_number || '',
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
      channel: 'web',
      testmode: false,
      ...opts,
      lineItems: source.items ? this.mapLineItems(source.items as any) : [],
      subtotal: {
        value: source.total_price?.toString() || '0',
        currency: source.currency || 'USD',
      },
      shippingTotal: {
        value: source.total_shipping?.toString() || '0',
        currency: source.currency || 'USD',
      },
      discountTotal: {
        value: source.total_discount?.toString() || '0',
        currency: source.currency || 'USD',
      },
      taxTotal: {
        value: source.total_tax?.toString() || '0',
        currency: source.currency || 'USD',
      },
      refundedTotal: { value: '0', currency: source.currency || 'USD' },
      grandTotal: {
        value: (
          (source.total_price || 0) +
          (source.total_shipping || 0) -
          (source.total_discount || 0)
        ).toString(),
        currency: source.currency || 'USD',
      },
    };

    if (source.fulfillment_status) {
      result.fulfillmentStatus = source.fulfillment_status;
    }

    return result;
  }

  async unify(
    source: SquarespaceOrderOutput | SquarespaceOrderOutput[],
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
    order: SquarespaceOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const opts: any = {};
    if (order.customerEmail) {
      const customers = await this.ingestService.ingestData<
        UnifiedEcommerceCustomerOutput,
        SquarespaceCustomerOutput
      >(
        [
          {
            firstName: order.shippingAddress.firstName,
            lastName: order.shippingAddress.lastName,
            address: order.shippingAddress,
            email: order.customerEmail,
          },
        ],
        'squarespace',
        connectionId,
        'ecommerce',
        EcommerceObject.customer,
        [],
      );
      if (customers && customers[0]) {
        opts.customer_id = customers[0].id_ecom_customer;
      }
    }
    return {
      remote_id: order.id?.toString(),
      remote_data: order,
      order_status: null,
      order_number: order.orderNumber?.toString() || '',
      payment_status: 'PAID',
      currency: (order.subtotal.currency as CurrencyCode) || null,
      total_price: parseInt(order.subtotal.value || '0'),
      total_discount: parseInt(order.discountTotal?.value || '0'),
      total_shipping: parseInt(order.shippingTotal?.value || '0'),
      total_tax: parseInt(order.taxTotal?.value || '0'),
      fulfillment_status: order.fulfillmentStatus || '',
      field_mappings: customFieldMappings?.reduce(
        (acc, mapping) => ({
          ...acc,
          [mapping.slug]:
            order[mapping.remote_id as keyof SquarespaceOrderOutput],
        }),
        {},
      ),
      ...opts,
    };
  }

  private mapLineItems(items: any[]) {
    return items.map((item) => ({
      variantId: item.variantId || '',
      sku: item.sku || null,
      weight: item.weight || 0,
      width: item.width || 0,
      length: item.length || 0,
      height: item.height || 0,
      productId: item.productId || '',
      productName: item.productName || '',
      quantity: item.quantity || 0,
      unitPricePaid: {
        value: item.unitPricePaid?.value || '0',
        currency: item.unitPricePaid?.currency || 'USD',
      },
      variantOptions: item.variantOptions || null,
      customizations: item.customizations || null,
      imageUrl: item.imageUrl || '',
      lineItemType: item.lineItemType || '',
    }));
  }
}
