import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { RetryHandler } from '@@core/@core-services/request-retry/retry.handler';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  AbstractBaseConnectionService,
  OAuthCallbackParams,
  PassthroughInput,
  RefreshParams,
} from '@@core/connections/@utils/types';
import { PassthroughResponse } from '@@core/passthrough/types';
import { Injectable } from '@nestjs/common';
import {
  AuthStrategy,
  CONNECTORS_METADATA,
  DynamicApiUrl,
  providerToType,
} from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../registry.service';

export type ShopifyOAuthResponse = {
  access_token: string;
  scope: string;
};

@Injectable()
export class ShopifyConnectionService extends AbstractBaseConnectionService {
  private readonly type: string;

  constructor(
    protected prisma: PrismaService,
    private logger: LoggerService,
    protected cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private connectionUtils: ConnectionUtils,
    private cService: ConnectionsStrategiesService,
    private retryService: RetryHandler,
  ) {
    super(prisma, cryptoService);
    this.logger.setContext(ShopifyConnectionService.name);
    this.registry.registerService('shopify', this);
    this.type = providerToType('shopify', 'ecommerce', AuthStrategy.oauth2);
  }

  async passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse> {
    try {
      const { headers } = input;
      const config = await this.constructPassthrough(input, connectionId);

      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });

      config.headers['X-Shopify-Access-Token'] = this.cryptoService.decrypt(
        connection.access_token,
      );

      config.headers = {
        ...config.headers,
        ...headers,
      };

      return await this.retryService.makeRequest(
        {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: config.headers,
        },
        'ecommerce.shopify.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  handleTokenRefresh?(opts: RefreshParams): Promise<any> {
    return Promise.resolve();
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, body } = opts;
      const { api_key, store_url } = body;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'woocommerce',
          vertical: 'ecommerce',
        },
      });

      let db_res;
      const connection_token = uuidv4();
      const BASE_API_URL = (
        CONNECTORS_METADATA['ecommerce']['shopify'].urls.apiUrl as DynamicApiUrl
      )(store_url);
      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(api_key),
            account_url: BASE_API_URL,
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'shopify',
            vertical: 'ecommerce',
            token_type: 'basic',
            account_url: BASE_API_URL,
            access_token: this.cryptoService.encrypt(api_key),
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: {
                id_linked_user: await this.connectionUtils.getLinkedUserId(
                  projectId,
                  linkedUserId,
                ),
              },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      throw error;
    }
  }

  redirectUponConnection(...params: any[]): void {
    const [{ res, host, shop }] = params;

    return res.redirect(`/?shop=${shop}&host=${encodeURIComponent(host)}`);
  }
}
