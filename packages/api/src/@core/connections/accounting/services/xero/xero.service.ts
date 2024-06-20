import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { IAccountingConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import {
  OAuth2AuthData,
  providerToType,
  CONNECTORS_METADATA,
  AuthStrategy,
} from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import {
  OAuthCallbackParams,
  RefreshParams,
} from '@@core/connections/@utils/types';
import { jwtDecode } from 'jwt-decode';

export type XeroOAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: string | number;
  token_type: string;
};

type DecodedJWTToken = {
  authentication_event_id: string;
  sub: string;
  nbf: number;
  exp: number;
  iss: string;
  aud: string;
  client_id: string;
  auth_time: string;
  xero_userid: string;
  global_session_id: string;
  scope: string[];
};

function decodeJWT(token: string): DecodedJWTToken {
  try {
    const decoded = jwtDecode<DecodedJWTToken>(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

@Injectable()
export class XeroConnectionService implements IAccountingConnectionService {
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
    this.logger.setContext(XeroConnectionService.name);
    this.registry.registerService('xero', this);
    this.type = providerToType('xero', 'accounting', AuthStrategy.oauth2);
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'xero',
          vertical: 'accounting',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      });
      this.logger.log(
        `data 64 is ${Buffer.from(
          `${CREDENTIALS.CLIENT_ID}:${CREDENTIALS.CLIENT_SECRET}`,
        ).toString('base64')}`,
      );
      const res = await axios.post(
        'https://identity.xero.com/connect/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${CREDENTIALS.CLIENT_ID}:${CREDENTIALS.CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      const data: XeroOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : xero accounting ' + JSON.stringify(data),
      );

      //TODO: decode the access_token and extract the authEventId used to retrieve tenantId, we'll use the first one by default
      const decodedJWT: DecodedJWTToken = decodeJWT(data.access_token);

      const res_ = await axios.get(
        `https://api.xero.com/connections?=authEventId${decodedJWT.authentication_event_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.access_token}`,
          },
        },
      );

      //Important Note: Xero asks for a tenantId for which the token is valid for so we append it as a param and it MUST be extracted when making the calls in unified requests
      const CUSTOM_ACCOUNT_URL = `${
        CONNECTORS_METADATA['accounting']['xero'].urls.apiUrl as string
      }?xeroTenantId=${res_.data[0].tenantId}`;

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
            account_url: CUSTOM_ACCOUNT_URL,
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
            provider_slug: 'xero',
            vertical: 'accounting',
            token_type: 'oauth',
            account_url: CUSTOM_ACCOUNT_URL,
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
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const res = await axios.post(
        'https://identity.xero.com/connect/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${CREDENTIALS.CLIENT_ID}:${CREDENTIALS.CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      const data: XeroOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : xero ');
    } catch (error) {
      throw error;
    }
  }
}
