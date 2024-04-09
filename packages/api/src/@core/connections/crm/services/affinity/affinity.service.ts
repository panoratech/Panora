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
  ICrmConnectionService,
} from '../../types';
import { ServiceRegistry } from '../registry.service';
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { AuthStrategy } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

export type AffinityOAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

@Injectable()
export class AffinityConnectionService implements ICrmConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(AffinityConnectionService.name);
    this.registry.registerService('affinity', this);
    this.type = providerToType('affinity', 'crm', AuthStrategy.oauth2);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: `affinity`,
          vertical: 'crm',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;
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
      const subdomain = 'panora';
      const res = await axios.post('', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const data: AffinityOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : affinity ticketing ' + JSON.stringify(data),
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
            account_url: '',
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_at) * 1000,
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
            provider_slug: 'affinity',
            vertical: 'crm',
            token_type: 'oauth',
            account_url: '',
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
            expiration_timestamp: new Date(
              new Date().getTime() + Number(data.expires_at) * 1000,
            ),
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
      handleServiceError(error, this.logger, 'affinity', Action.oauthCallback);
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

      //const subdomain = 'panora';
      const res = await axios.post('', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Basic JHt0aGlzLmVudi5nZXRgQWZmaW5pdHlTZWNyZXRgKCkuQ0xJRU5UX0lEfTokewogICAgICAgICAgICAgICAgdGhpcy5lbnYuZ2V0YEFmZmluaXR5U2VjcmV0YCgpLkNMSUVOVF9TRUNSRVQKICAgICAgICAgICAgICB9`,
        },
      });
      const data: AffinityOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + Number(data.expires_at) * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : affinity ');
    } catch (error) {
      handleServiceError(error, this.logger, 'affinity', Action.oauthRefresh);
    }
  }
}
