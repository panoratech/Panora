import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { IOrderService } from '@ecommerce/order/types';
import { Injectable } from '@nestjs/common';
import { EcommerceObject } from '@panora/shared';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AmazonOrderInput, AmazonOrderOutput } from './types';

type Marketplace = {
  country: string;
  marketplaceId: string;
  countryCode: string;
};

const marketplaces: Marketplace[] = [
  { country: 'Canada', marketplaceId: 'A2EUQ1WTGCTBG2', countryCode: 'CA' },
  {
    country: 'United States of America',
    marketplaceId: 'ATVPDKIKX0DER',
    countryCode: 'US',
  },
  { country: 'Mexico', marketplaceId: 'A1AM78C64UM0Y8', countryCode: 'MX' },
  { country: 'Brazil', marketplaceId: 'A2Q3Y263D00KWC', countryCode: 'BR' },
  { country: 'Spain', marketplaceId: 'A1RKKUPIHCS9HS', countryCode: 'ES' },
  {
    country: 'United Kingdom',
    marketplaceId: 'A1F83G8C2ARO7P',
    countryCode: 'UK',
  },
  { country: 'France', marketplaceId: 'A13V1IB3VIYZZH', countryCode: 'FR' },
  { country: 'Belgium', marketplaceId: 'AMEN7PMS3EDWL', countryCode: 'BE' },
  {
    country: 'Netherlands',
    marketplaceId: 'A1805IZSGTT6HS',
    countryCode: 'NL',
  },
  { country: 'Germany', marketplaceId: 'A1PA6795UKMFR9', countryCode: 'DE' },
  { country: 'Italy', marketplaceId: 'APJ6JRA9NG5V4', countryCode: 'IT' },
  { country: 'Sweden', marketplaceId: 'A2NODRKZP88ZB9', countryCode: 'SE' },
  {
    country: 'South Africa',
    marketplaceId: 'AE08WJ6YKNBMC',
    countryCode: 'ZA',
  },
  { country: 'Poland', marketplaceId: 'A1C3SOZRARQ6R3', countryCode: 'PL' },
  { country: 'Egypt', marketplaceId: 'ARBP9OOSHTCHU', countryCode: 'EG' },
  { country: 'Turkey', marketplaceId: 'A33AVAJ2PDY3EV', countryCode: 'TR' },
  {
    country: 'Saudi Arabia',
    marketplaceId: 'A17E79C6D8DWNP',
    countryCode: 'SA',
  },
  {
    country: 'United Arab Emirates',
    marketplaceId: 'A2VIGQ35RCS4UG',
    countryCode: 'AE',
  },
  { country: 'India', marketplaceId: 'A21TJRUUN4KGV', countryCode: 'IN' },
  { country: 'Singapore', marketplaceId: 'A19VAU5U5O7RUS', countryCode: 'SG' },
  { country: 'Australia', marketplaceId: 'A39IBJ37TRP1C6', countryCode: 'AU' },
  { country: 'Japan', marketplaceId: 'A1VC38T7YXB528', countryCode: 'JP' },
];

@Injectable()
export class AmazonService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.order.toUpperCase() + ':' + AmazonService.name,
    );
    this.registry.registerService('amazon', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<AmazonOrderOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'amazon',
          vertical: 'ecommerce',
        },
      });
      const specificMarketplaceIds = marketplaces.map(
        (marketplace) => marketplace.marketplaceId,
      );
      const resp = await axios.get(
        `${connection.account_url}/orders/v0/orders?MarketplaceIds=${specificMarketplaceIds}&CreatedAfter=2010-10-10`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-amz-access-token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );
      const orders: AmazonOrderOutput[] = resp.data.payload.Orders;
      const ordersWithLineItems = await Promise.all(
        orders.map(async (order) => {
          const res = await axios.get(
            `${connection.account_url}/orders/${order.AmazonOrderId}/orderItems`,
            {
              headers: {
                'Content-Type': 'application/json',
                'x-amz-access-token': this.cryptoService.decrypt(
                  connection.access_token,
                ),
              },
            },
          );
          return { ...order, LineItems: res.data.payload.OrderItems };
        }),
      );
      this.logger.log(`Synced amazon orders !`);

      return {
        data: ordersWithLineItems,
        message: 'Amazon orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
