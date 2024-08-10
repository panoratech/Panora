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

type ZohoUrlType = {
  [key: string]: {
    authBase: string;
    apiBase: string;
  };
};
export const ZOHOLocations: ZohoUrlType = {
  us: {
    authBase: 'https://accounts.zoho.com',
    apiBase: 'https://www.zohoapis.com',
  },
  eu: {
    authBase: 'https://accounts.zoho.eu',
    apiBase: 'https://www.zohoapis.eu',
  },
  in: {
    authBase: 'https://accounts.zoho.in',
    apiBase: 'https://www.zohoapis.in',
  },
  au: {
    authBase: 'https://accounts.zoho.com.au',
    apiBase: 'https://www.zohoapis.com.au',
  },
  jp: {
    authBase: 'https://accounts.zoho.jp',
    apiBase: 'https://www.zohoapis.jp',
  },
};

function getDomainSuffix(url: string): string | null {
  try {
    const domain = new URL(url).hostname;
    const parts = domain.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
    return null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export interface ZohoOAuthResponse {
  access_token: string;
  refresh_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

//TODO: manage domains
@Injectable()
export class ZohoConnectionService extends AbstractBaseConnectionService {
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
    this.logger.setContext(ZohoConnectionService.name);
    this.registry.registerService('zoho', this);
    this.type = providerToType('zoho', 'crm', AuthStrategy.oauth2);
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

      config.headers[
        'Authorization'
      ] = `Zoho-oauthtoken ${this.cryptoService.decrypt(
        connection.access_token,
      )}`;

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
        'crm.zoho.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code, location } = opts;
      if (!location) {
        throw new ReferenceError(`no zoho location, found ${location}`);
      }
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
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
      //no refresh token
      const authDomain = ZOHOLocations[location].authBase;
      const res = await axios.post(
        `${authDomain}/oauth/v2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZohoOAuthResponse = res.data;
      this.logger.log('OAuth credentials : zoho ' + JSON.stringify(data));
      let db_res;
      const connection_token = uuidv4();
      const BASE_API_URL = (
        CONNECTORS_METADATA['crm']['zoho'].urls.apiUrl as DynamicApiUrl
      )(ZOHOLocations[location].apiBase);
      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: data.refresh_token
              ? this.cryptoService.encrypt(data.refresh_token)
              : '',
            expiration_timestamp: new Date(
              new Date().getTime() + data.expires_in * 1000,
            ),
            status: 'valid',
            created_at: new Date(),
            account_url: BASE_API_URL,
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'zoho',
            vertical: 'crm',
            token_type: 'oauth2',
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: data.refresh_token
              ? this.cryptoService.encrypt(data.refresh_token)
              : '',
            expiration_timestamp: new Date(
              new Date().getTime() + data.expires_in * 1000,
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
            account_url: BASE_API_URL,
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
      const { connectionId, refreshToken, account_url, projectId } = opts;
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });

      const res = await axios.post(
        `${
          ZOHOLocations[getDomainSuffix(account_url)].authBase
        }/oauth/v2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZohoOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : zoho ');
    } catch (error) {
      throw error;
    }
  }
}
