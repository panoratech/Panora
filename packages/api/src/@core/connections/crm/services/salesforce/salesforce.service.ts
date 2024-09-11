import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
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
  OAuth2AuthData,
  providerToType,
} from '@panora/shared';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../registry.service';

export type SalesforceAuthResponse = {
  access_token: string;
  signature: string;
  scope: string;
  id_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  refresh_token: string;
};

@Injectable()
export class SalesforceConnectionService extends AbstractBaseConnectionService {
  private readonly type: string;

  constructor(
    protected prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    protected cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
    private retryService: RetryHandler,
  ) {
    super(prisma, cryptoService);
    this.logger.setContext(SalesforceConnectionService.name);
    this.registry.registerService('salesforce', this);
    this.type = providerToType('salesforce', 'crm', AuthStrategy.oauth2);
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

      config.headers['Authorization'] = `Bearer ${Buffer.from(
        `${this.cryptoService.decrypt(connection.access_token)}:`,
      ).toString('base64')}`;

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
        'crm.salesforce.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code, domain } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'salesforce',
          vertical: 'crm',
        },
      });
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      });
      const res = await axios.post(
        `https://${domain}.my.salesforce.com/services/oauth2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: SalesforceAuthResponse = res.data;
      // save tokens for this customer inside our db
      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        // Update existing connection
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + 90 * 60 * 1000, // 90 minutes in milliseconds
            ),
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        // Create new connection
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'salesforce',
            vertical: 'crm',
            token_type: 'oauth2',
            account_url: (
              CONNECTORS_METADATA['crm']['salesforce'].urls
                .apiUrl as DynamicApiUrl
            )(domain),
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + 90 * 60 * 1000, // 90 minutes in milliseconds
            ),
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
      this.logger.log('Successfully added tokens inside DB ' + db_res);
      return db_res;
    } catch (error) {
      throw error;
    }
  }

  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken, projectId } = opts;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const params = {
        grant_type: 'refresh_token',
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        refresh_token: this.cryptoService.decrypt(refreshToken),
      };
      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });

      const queryString = new URLSearchParams(params).toString();
      const url = `${connection.account_url}/services/oauth2/token`;
      const res = await axios.post(url, queryString, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const data: SalesforceAuthResponse = res.data;
      const res_ = await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + 90 * 60 * 1000, // 90 minutes in milliseconds
          ),
        },
      });
      this.logger.log('OAuth credentials updated : salesforce');
    } catch (error) {
      throw error;
    }
  }
}
