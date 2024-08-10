import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ManagedWebhooksService } from '@@core/@core-services/webhooks/third-parties-webhooks/managed-webhooks.service';
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
import { RetryHandler } from '@@core/@core-services/request-retry/retry.handler';

export interface ZendeskOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
@Injectable()
export class ZendeskConnectionService extends AbstractBaseConnectionService {
  private readonly type: string;

  constructor(
    protected prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    protected cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
    private connectionUtils: ConnectionUtils,
    private mwService: ManagedWebhooksService,
    private retryService: RetryHandler,
  ) {
    super(prisma, cryptoService);
    this.logger.setContext(ZendeskConnectionService.name);
    this.registry.registerService('zendesk', this);
    this.type = providerToType('zendesk', 'ticketing', AuthStrategy.oauth2);
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
        'ticketing.zendesk.passthrough',
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
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
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
        redirect_uri: REDIRECT_URI,
        code: code,
        client_id: CREDENTIALS.CLIENT_ID,
        client_secret: CREDENTIALS.CLIENT_SECRET,
        scope: 'read',
      });

      this.logger.log('Data Form is ' + JSON.stringify(formData));

      const res = await axios.post(
        `https://${CREDENTIALS.SUBDOMAIN}.zendesk.com/oauth/tokens`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZendeskOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : zendesk ticketing ' + JSON.stringify(data),
      );

      let db_res;
      const connection_token = uuidv4();
      const BASE_API_URL = (
        CONNECTORS_METADATA['ticketing']['zendesk'].urls.apiUrl as DynamicApiUrl
      )(CREDENTIALS.SUBDOMAIN);

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            account_url: BASE_API_URL,
            refresh_token: '',
            expiration_timestamp: new Date(), //TODO
            status: 'valid',
            created_at: new Date(),
          },
        });
      } else {
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            connection_token: connection_token,
            provider_slug: 'zendesk',
            vertical: 'ticketing',
            token_type: 'oauth2',
            account_url: BASE_API_URL,
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: '',
            expiration_timestamp: new Date(), //TODO
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
      // upsert the creation of a managed webhook + 3rdpartywebhook
      if (
        CONNECTORS_METADATA['ticketing']['zendesk'].realTimeWebhookMetadata
          .method == 'API'
      ) {
        const scopes =
          CONNECTORS_METADATA['ticketing']['zendesk'].realTimeWebhookMetadata
            .events;
        const exclude: string[] = [
          'ticketing.tickets.events',
          'ticketing.comments.events',
          'ticketing.tags.events',
          'ticketing.attachments.events',
        ];

        // Filter the array to exclude specified elements
        const filteredEvents = scopes.filter(
          (event) => !exclude.includes(event),
        );

        const basic_mw = await this.mwService.createManagedWebhook({
          id_connection: db_res.id_connection,
          scopes: filteredEvents,
        });
        const trigger_mw = await this.mwService.createManagedWebhook({
          id_connection: db_res.id_connection,
          scopes: exclude,
        });
        await this.mwService.createRemoteThirdPartyWebhook({
          id_connection: db_res.id_connection,
          mw_ids: [basic_mw.id_managed_webhook, trigger_mw.id_managed_webhook],
          data: {
            name_basic: 'Panora Webhook Events',
            name_trigger: 'Panora Tickets Related Events Webhook',
          },
        });
      }
      return db_res;
    } catch (error) {
      throw error;
    }
  }

  async revokeAccessTokens(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'ticketing',
        },
      });
      const res_ = await axios.get(
        `https://d3v-panora3441.zendesk.com/api/v2/oauth/tokens`,
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      for (const obj of res_.data.tokens) {
        try {
          const res = await axios.delete(
            `https://d3v-panora3441.zendesk.com/api/v2/oauth/tokens/${obj.id}.json`,
            {
              headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: `Bearer ${this.cryptoService.decrypt(
                  connection.access_token,
                )}`,
              },
            },
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
