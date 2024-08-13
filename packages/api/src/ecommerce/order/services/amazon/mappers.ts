import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { AmazonOrderOutput, AmazonOrderInput } from './types';
import { CurrencyCode } from '@@core/utils/types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedEcommerceCustomerOutput } from '@ecommerce/customer/types/model.unified';
import { AmazonCustomerOutput } from '@ecommerce/customer/services/amazon/types';
import { EcommerceObject } from '@ecommerce/@lib/@types';

@Injectable()
export class AmazonOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'order', 'amazon', this);
  }

  async desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AmazonOrderInput> {
    return;
  }

  async unify(
    source: AmazonOrderOutput | AmazonOrderOutput[],
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
    order: AmazonOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput> {
    const opts: any = {};

    // insert the buyer in the customers table
    if (order.BuyerInfo) {
      const customers = await this.ingestService.ingestData<
        UnifiedEcommerceCustomerOutput,
        AmazonCustomerOutput
      >(
        [
          {
            BuyerEmail: order.BuyerInfo.BuyerEmail,
            BuyerName: order.BuyerInfo.BuyerName,
            Address: order.ShippingAddress,
          },
        ],
        'amazon',
        connectionId,
        'ecommerce',
        EcommerceObject.customer,
        [],
      );
      opts.customer_id = customers[0].id_ecom_customer;
    }
    if (order.BuyerInfo.PurchaseOrderNumber) {
      opts.order_number = order.BuyerInfo.PurchaseOrderNumber;
    }
    if (order.LineItems) {
      opts.items = order.LineItems.map((item) => {
        return {
          remote_id: item.OrderItemId,
          sku: item.SellerSKU || null,
          title: item.Title || null,
          quantity: item.QuantityOrdered,
          price: item.ItemPrice?.Amount || null,
          total: (
            parseFloat(item.ItemPrice?.Amount || '0') * item.QuantityOrdered
          ).toFixed(2),
          taxable: !!item.ItemTax,
          weight: item.Measurement.Value || undefined,
          tax_lines: item.ItemTax
            ? [
                {
                  title: 'Sales Tax',
                  price: item.ItemTax.Amount,
                  rate: 0, // Set appropriate tax rate if available
                },
              ]
            : [],
          discount_allocations: item.PromotionDiscount
            ? [
                {
                  amount: item.PromotionDiscount.Amount,
                  discount_application_index: 0, // Adjust as necessary
                },
              ]
            : [],
        };
      });
      // Calculate total_tax and total_discount
      const total_tax = opts.items.reduce((acc, item) => {
        const itemTax = item.tax_lines.reduce(
          (taxAcc, tax) => taxAcc + parseFloat(tax.price),
          0,
        );
        return acc + itemTax;
      }, 0);

      const total_discount = opts.items.reduce((acc, item) => {
        const itemDiscount = item.discount_allocations.reduce(
          (discountAcc, discount) => discountAcc + parseFloat(discount.amount),
          0,
        );
        return acc + itemDiscount;
      }, 0);

      opts.total_tax = total_tax.toFixed(2);
      opts.total_discount = total_discount.toFixed(2);
    }
    return {
      remote_id: order.AmazonOrderId,
      remote_data: order,
      order_status: order.OrderStatus ? order.OrderStatus.toUpperCase() : null,
      payment_status: 'SUCCESS',
      currency: (order.OrderTotal.CurrencyCode as CurrencyCode) || null,
      total_price: order.OrderTotal?.Amount
        ? parseFloat(order.OrderTotal?.Amount)
        : null,
      total_shipping: null,
      fulfillment_status: null,
      field_mappings: customFieldMappings?.reduce(
        (acc, mapping) => ({
          ...acc,
          [mapping.slug]: order[mapping.remote_id as keyof AmazonOrderOutput],
        }),
        {},
      ),
      ...opts,
    };
  }
}
