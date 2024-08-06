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

export type JiraCloudIdInformation = {
  id: string;
  name: string;
  url: string;
  scopes: Array<string>;
  avatarUrl: string;
};

export type JiraOAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number | Date;
  scope: string;
};

@Injectable()
export class JiraConnectionService extends AbstractBaseConnectionService {
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
    this.logger.setContext(JiraConnectionService.name);
    this.registry.registerService('jira', this);
    this.type = providerToType('jira', 'ticketing', AuthStrategy.oauth2);
  }
  async passthrough(
    input: PassthroughInput,
    connectionId: string,
  ): Promise<PassthroughResponse> {
    try {
      const { headers, req_type } = input;
      const config = await this.constructPassthrough(input, connectionId);

      const connection = await this.prisma.connections.findUnique({
        where: {
          id_connection: connectionId,
        },
      });
      if (req_type == 'MULTIPART') {
        config.headers['Authorization'] = `Bearer ${this.cryptoService.decrypt(
          connection.access_token,
        )}`;
        config.headers['Content-Type'] = 'application/json';
        config.headers['X-Atlassian-Token'] = 'no-check';
      }

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
        'ticketing.jira.passthrough',
        config.linkedUserId,
      );
    } catch (error) {
      throw error;
    }
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'jira',
          vertical: 'ticketing',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${
        this.env.getDistributionMode() == 'selfhost'
          ? this.env.getTunnelIngress()
          : this.env.getPanoraBaseUrl()
      }/connections/oauth/callback`;
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code',
      });
      const res = await axios.post(
        `https://auth.atlassian.com/oauth/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: JiraOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : jira ticketing ' + JSON.stringify(data),
      );

      // get the cloud id from atlassian jira, it is used across requests to the api
      //TODO: add a field inside our connections db to handle it
      const res_ = await axios.get(
        `https://api.atlassian.com/oauth/token/accessible-resources`,
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            Accept: 'application/json',
          },
        },
      );
      const sites_scopes: JiraCloudIdInformation[] = res_.data;

      const cloud_id: string = sites_scopes[0].id;
      let db_res;
      const connection_token = uuidv4();

      const access_token = this.cryptoService.encrypt(data.access_token);
      const refresh_token = this.cryptoService.encrypt(data.refresh_token);
      const BASE_API_URL = (
        CONNECTORS_METADATA['ticketing']['jira'].urls.apiUrl as DynamicApiUrl
      )(cloud_id);

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: access_token,
            refresh_token: refresh_token,
            account_url: BASE_API_URL,
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
            provider_slug: 'jira',
            vertical: 'ticketing',
            token_type: 'oauth2',
            account_url: BASE_API_URL,
            access_token: access_token,
            refresh_token: refresh_token,
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

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = {
        grant_type: 'refresh_token',
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        refresh_token: this.cryptoService.decrypt(refreshToken),
      };

      const res = await axios.post(
        `https://auth.atlassian.com/oauth/token`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data: JiraOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : jira ');
    } catch (error) {
      throw error;
    }
  }
}
