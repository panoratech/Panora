import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ICrmConnectionService } from '../../types';
import { LoggerService } from '@@core/logger/logger.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from '../registry.service';
import {
  OAuth2AuthData,
  CONNECTORS_METADATA,
  providerToType,
  DynamicApiUrl,
} from '@panora/shared';
import { AuthStrategy } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  OAuthCallbackParams,
  RefreshParams,
} from '@@core/connections/@utils/types';

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

export interface ZohoOAuthResponse {
  access_token: string;
  refresh_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

//TODO: manage domains
@Injectable()
export class ZohoConnectionService implements ICrmConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(ZohoConnectionService.name);
    this.registry.registerService('zoho', this);
    this.type = providerToType('zoho', 'crm', AuthStrategy.oauth2);
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
      const apiDomain = ZOHOLocations[location].apiBase;
      const BASE_API_URL = (
        CONNECTORS_METADATA['crm']['zoho'].urls.apiUrl as DynamicApiUrl
      )(apiDomain);

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
            token_type: 'oauth',
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
            account_url:
              apiDomain + CONNECTORS_METADATA['crm']['zoho'].urls.apiUrl,
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
        `${account_url}/oauth/v2/token`,
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
