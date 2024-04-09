import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Action, handleServiceError } from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  CallbackParams,
  RefreshParams,
  ITicketingConnectionService,
} from '../../types';
import { ServiceRegistry } from '../registry.service';
import { AuthStrategy } from '@panora/shared';
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

export interface ZendeskOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
@Injectable()
export class ZendeskConnectionService implements ITicketingConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(ZendeskConnectionService.name);
    this.registry.registerService('zendesk', this);
    this.type = providerToType('zendesk', 'ticketing', AuthStrategy.oauth2);
  }

  async handleCallback(opts: CallbackParams) {
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
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;
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

      //const subdomain = 'panora7548';
      const res = await axios.post(
        `${CREDENTIALS.SUBDOMAIN!}/oauth/tokens`,
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

      if (isNotUnique) {
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            account_url: CREDENTIALS.SUBDOMAIN!,
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
            token_type: 'oauth',
            account_url: CREDENTIALS.SUBDOMAIN!,
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: '',
            expiration_timestamp: new Date(), //TODO
            status: 'valid',
            created_at: new Date(),
            projects: {
              connect: { id_project: projectId },
            },
            linked_users: {
              connect: { id_linked_user: linkedUserId },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      handleServiceError(error, this.logger, 'zendesk', Action.oauthCallback);
    }
  }

  //todo: revoke ?
  //ZENDESK TICKETING OAUTH TOKENS DONT EXPIRE BUT THEY MAY BE REVOKED
  async handleTokenRefresh(opts: RefreshParams): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
