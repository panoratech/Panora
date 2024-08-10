import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { ICustomerService } from '@ecommerce/customer/types';
import { Injectable } from '@nestjs/common';
import { EcommerceObject } from '@panora/shared';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { WoocommerceCustomerOutput } from './types';

@Injectable()
export class WoocommerceService implements ICustomerService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.customer.toUpperCase() + ':' + WoocommerceService.name,
    );
    this.registry.registerService('woocommerce', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<WoocommerceCustomerOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'woocommerce',
          vertical: 'ecommerce',
        },
      });
      const decryptedData = JSON.parse(
        this.cryptoService.decrypt(connection.access_token),
      );

      const { username, password } = decryptedData;

      const resp = await axios.get(`${connection.account_url}/v3/customers`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      });
      const customers: WoocommerceCustomerOutput[] = resp.data;
      this.logger.log(`Synced woocommerce customers !`);

      return {
        data: customers,
        message: 'Woocommerce customers retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
