import {
  ShopifyFulfillmentInput,
  ShopifyFulfillmentOutput,
  ShopifyLineItem,
} from './types';
import {
  UnifiedEcommerceFulfillmentInput,
  UnifiedEcommerceFulfillmentOutput,
} from '@ecommerce/fulfillment/types/model.unified';
import { IFulfillmentMapper } from '@ecommerce/fulfillment/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class ShopifyFulfillmentMapper implements IFulfillmentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'fulfillment',
      'shopify',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceFulfillmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyFulfillmentInput> {
    return;
  }

  async unify(
    source: ShopifyFulfillmentOutput | ShopifyFulfillmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceFulfillmentOutput | UnifiedEcommerceFulfillmentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleFulfillmentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ShopifyFulfillmentOutput
    return Promise.all(
      source.map((fulfillment) =>
        this.mapSingleFulfillmentToUnified(
          fulfillment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapLineItems(
    lineItems?: ShopifyLineItem[],
    connectionId?: string,
  ): Promise<Record<string, any>[]> {
    if (!lineItems) return [];
    return Promise.all(
      lineItems.map(async (item) => {
        const res: any = {
          remote_id: item.id,
          remote_data: item,
          //variant_id: item.variant_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          grams: item.grams,
          sku: item.sku,
          variant_title: item.variant_title,
          vendor: item.vendor,
          fulfillment_service: item.fulfillment_service,
          requires_shipping: item.requires_shipping,
          taxable: item.taxable,
          gift_card: item.gift_card,
          name: item.name,
          variant_inventory_management: item.variant_inventory_management,
          properties: item.properties,
          product_exists: item.product_exists,
          fulfillable_quantity: item.fulfillable_quantity,
          total_discount: item.total_discount,
          fulfillment_status: item.fulfillment_status,
          //fulfillment_line_item_id: item.fulfillment_line_item_id, //
          tax_lines: item.tax_lines,
          duties: item.duties,
        };

        const product_id = await this.utils.getProductIdFromRemote(
          item.product_id?.toString(),
          connectionId,
        );
        if (product_id) {
          res.product_id = product_id;
        }

        return res;
      }),
    );
  }
  private async mapSingleFulfillmentToUnified(
    fulfillment: ShopifyFulfillmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceFulfillmentOutput> {
    const opts: any = {};
    if (fulfillment.order_id) {
      const order_id = await this.utils.getOrderIdFromRemote(
        fulfillment.order_id?.toString(),
        connectionId,
      );
      if (order_id) {
        opts.order_id = order_id;
      }
    }
    return {
      remote_id: fulfillment.id?.toString(),
      remote_data: fulfillment,
      carrier: fulfillment.tracking_company,
      tracking_numbers: fulfillment.tracking_numbers,
      tracking_urls: fulfillment.tracking_urls,
      items: this.mapLineItems(fulfillment.line_items),
      ...opts,
    };
  }
}
