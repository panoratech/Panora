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
  OAuth2AuthData,
  providerToType,
} from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../registry.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import axios from 'axios';

export interface FaireOAuthResponse {
  accessToken: string;
  tokenType: string;
}

@Injectable()
export class FaireConnectionService extends AbstractBaseConnectionService {
  private readonly type: string;

  constructor(
    protected prisma: PrismaService,
    private logger: LoggerService,
    protected cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
    private connectionUtils: ConnectionUtils,
    private cService: ConnectionsStrategiesService,
    private retryService: RetryHandler,
  ) {
    super(prisma, cryptoService);
    this.logger.setContext(FaireConnectionService.name);
    this.registry.registerService('faire', this);
    this.type = providerToType('faire', 'ecommerce', AuthStrategy.oauth2);
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

      const CREDENTIALS = (await this.cService.getCredentials(
        connection.id_project,
        this.type,
      )) as OAuth2AuthData;

      const access_token = JSON.parse(
        this.cryptoService.decrypt(connection.access_token),
      );
      config.headers = {
        ...config.headers,
        ...headers,
        'X-FAIRE-OAUTH-ACCESS-TOKEN': access_token,
        'X-FAIRE-APP-CREDENTIALS': Buffer.from(
          `${CREDENTIALS.CLIENT_ID}:${CREDENTIALS.CLIENT_SECRET}`,
        ).toString('base64'),
      };

      return await this.retryService.makeRequest(
        {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: config.headers,
        },
        'ecommerce.faire.passthrough',
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
          provider_slug: 'faire',
          vertical: 'ecommerce',
        },
      });
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        redirect_url: REDIRECT_URI,
        applicationId: CREDENTIALS.CLIENT_ID,
        applicationSecret: CREDENTIALS.CLIENT_SECRET,
        scope: CONNECTORS_METADATA['ecommerce']['faire'].scopes,
        authorization_code: code,
        grant_type: 'AUTHORIZATION_CODE',
      });
      const res = await axios.post(
        'https://www.faire.com/api/external-api-oauth2/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: FaireOAuthResponse = res.data;
      // save tokens for this customer inside our db
      let db_res;
      const connection_token = uuidv4();
      const BASE_API_URL = CONNECTORS_METADATA['ecommerce']['faire'].urls
        .apiUrl as string;

      if (isNotUnique) {
        // Update existing connection
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.accessToken),
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
            provider_slug: 'faire',
            vertical: 'ecommerce',
            token_type: 'oauth2',
            account_url: BASE_API_URL,
            access_token: this.cryptoService.encrypt(data.accessToken),
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
    return;
  }
}
