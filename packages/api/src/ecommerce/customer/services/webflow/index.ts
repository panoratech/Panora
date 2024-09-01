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
import { WebflowCustomerOutput } from './types';

@Injectable()
export class WebflowService implements ICustomerService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${EcommerceObject.customer.toUpperCase()}:${WebflowService.name}`,
    );
    this.registry.registerService('webflow', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<WebflowCustomerOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'webflow',
          vertical: 'ecommerce',
        },
      });

      const resp = await axios.get(`${connection.account_url}/users`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const customers: WebflowCustomerOutput[] = resp.data.users;

      this.logger.log(`Synced webflow customers !`);

      return {
        data: customers,
        message: 'Webflow customers retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
