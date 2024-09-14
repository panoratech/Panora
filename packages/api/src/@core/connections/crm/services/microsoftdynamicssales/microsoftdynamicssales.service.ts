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
import { AuthStrategy, OAuth2AuthData, providerToType } from '@panora/shared';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../registry.service';

export type MicrosoftDynamicsSalesOAuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

@Injectable()
export class MicrosoftDynamicsSalesConnectionService extends AbstractBaseConnectionService {
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
    this.logger.setContext(MicrosoftDynamicsSalesConnectionService.name);
    this.registry.registerService('microsoftdynamicssales', this);
    this.type = providerToType(
      'microsoftdynamicssales',
      'crm',
      AuthStrategy.oauth2,
    );
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

      config.headers['Authorization'] = `Basic ${Buffer.from(
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
        'crm.microsoftdynamicssales.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code, organization_name } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'microsoftdynamicssales',
          vertical: 'crm',
        },
      });

      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        redirect_uri: REDIRECT_URI,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        code: code,
        scope: `https://${organization_name}/.default offline_access`,
        grant_type: 'authorization_code',
      });
      const res = await axios.post(
        `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: MicrosoftDynamicsSalesOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : microsoftdynamicssales crm ' +
          JSON.stringify(data),
      );

      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            account_url: `https://${organization_name}`,
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'microsoftdynamicssales',
            vertical: 'crm',
            token_type: 'oauth2',
            account_url: `https://${organization_name}`,
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_in) * 1000,
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
      return db_res;
    } catch (error) {
      throw error;
    }
  }
  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken, projectId } = opts;
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const conn = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        scope: `${conn.account_url}/.default offline_access`,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        refresh_token: this.cryptoService.decrypt(refreshToken),
        redirect_uri: REDIRECT_URI,
      });

      const res = await axios.post(
        `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: MicrosoftDynamicsSalesOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + Number(data.expires_in) * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : microsoftdynamicssales ');
    } catch (error) {
      throw error;
    }
  }
}
