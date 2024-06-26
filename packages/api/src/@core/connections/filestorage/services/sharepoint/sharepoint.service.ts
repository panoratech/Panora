import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import {
  Action,
  ActionType,
  ConnectionsError,
  format3rdPartyError,
  throwTypedError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { IFilestorageConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import {
  AuthStrategy,
  CONNECTORS_METADATA,
  OAuth2AuthData,
  providerToType,
} from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import {
  OAuthCallbackParams,
  RefreshParams,
} from '@@core/connections/@utils/types';

export type SharepointOAuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

//TODO
@Injectable()
export class SharepointConnectionService
  implements IFilestorageConnectionService
{
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
    this.logger.setContext(SharepointConnectionService.name);
    this.registry.registerService('sharepoint', this);
    this.type = providerToType(
      'sharepoint',
      'filestorage',
      AuthStrategy.oauth2,
    );
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'sharepoint',
          vertical: 'filestorage',
        },
      });

      const REDIRECT_URI = `${
        this.env.getDistributionMode() == 'selfhost'
          ? this.env.getWebhookIngress()
          : this.env.getPanoraBaseUrl()
      }/connections/oauth/callback`;

      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const formData = new URLSearchParams({
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code',
      });
      const res = await axios.post(
        `https://app.sharepoint.com/oauth2/tokens`,
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
      const data: SharepointOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : sharepoint filestorage ' + JSON.stringify(data),
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
            account_url: CONNECTORS_METADATA['filestorage']['sharepoint'].urls
              .apiUrl as string,
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
            provider_slug: 'sharepoint',
            vertical: 'filestorage',
            token_type: 'oauth',
            account_url: CONNECTORS_METADATA['filestorage']['sharepoint'].urls
              .apiUrl as string,
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
      const REDIRECT_URI = `${
        this.env.getDistributionMode() == 'selfhost'
          ? this.env.getWebhookIngress()
          : this.env.getPanoraBaseUrl()
      }/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
        redirect_uri: REDIRECT_URI,
      });
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const res = await axios.post(
        `https://app.sharepoint.com/oauth2/tokens`,
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
      const data: SharepointOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : sharepoint ');
    } catch (error) {
      throw error;
    }
  }
}
