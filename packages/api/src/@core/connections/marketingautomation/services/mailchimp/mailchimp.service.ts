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
import { IMarketingAutomationConnectionService } from '../../types';
import { ServiceRegistry } from '../registry.service';
import { AuthStrategy } from '@panora/shared';
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import {
  OAuthCallbackParams,
  RefreshParams,
} from '@@core/connections/@utils/types';

export type MailchimpOAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
};

@Injectable()
export class MailchimpConnectionService
  implements IMarketingAutomationConnectionService
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
    this.logger.setContext(MailchimpConnectionService.name);
    this.registry.registerService('mailchimp', this);
    this.type = providerToType(
      'mailchimp',
      'marketingautomation',
      AuthStrategy.oauth2,
    );
  }

  async handleCallback(opts: OAuthCallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'mailchimp',
          vertical: 'marketingautomation',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${this.env.getPanoraBaseUrl()}/connections/oauth/callback`;
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
        'https://login.mailchimp.com/oauth2/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: MailchimpOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : mailchimp ticketing ' + JSON.stringify(data),
      );

      //get right server to make right api calls
      const res_ = await axios.post(
        'https://login.mailchimp.com/oauth2/metadata',
        formData.toString(),
        {
          headers: {
            Authorization: `OAuth ${data.access_token}`,
          },
        },
      );
      const server_url = res_.data;
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
            account_url: server_url,
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
            provider_slug: 'mailchimp',
            vertical: 'marketingautomation',
            token_type: 'oauth',
            account_url: server_url,
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
    return;
  }
}
