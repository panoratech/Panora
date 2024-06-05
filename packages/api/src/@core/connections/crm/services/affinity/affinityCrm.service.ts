import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import {
    CallbackParams,
    ICrmConnectionService,
    RefreshParams,
  } from '../../types';
  import { PrismaService } from '@@core/prisma/prisma.service';
  import axios from 'axios';
  import { v4 as uuidv4 } from 'uuid';
  import { Action, handleServiceError } from '@@core/utils/errors';
  import { EnvironmentService } from '@@core/environment/environment.service';
  import { EncryptionService } from '@@core/encryption/encryption.service';
  import { ServiceRegistry } from '../registry.service';
  import { LoggerService } from '@@core/logger/logger.service';
  import {
    OAuth2AuthData,
    CONNECTORS_METADATA,
    providerToType,
  } from '@panora/shared';
  import { AuthStrategy } from '@panora/shared';
  import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
  import { ConnectionUtils } from '@@core/connections/@utils';
  
@Injectable()
export class AffinityConnectionService implements ICrmConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private httpService: HttpService, // Add HttpService for making HTTP requests
  ) {
    this.logger.setContext(AffinityConnectionService.name);
    this.registry.registerService('affinity', this);
  }

  async handleCallback(opts: CallbackParams): Promise<Connection> {
    const { linkedUserId, projectId, code } = opts;
    const clientId = this.env.get('AFFINITY_CLIENT_ID');
    const clientSecret = this.env.get('AFFINITY_CLIENT_SECRET');
    const redirectUri = this.env.get('AFFINITY_REDIRECT_URI');

    try {
      const tokenResponse = await lastValueFrom(this.httpService.post('https://api.affinity.co/oauth/token', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }));

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      const connection = await this.prisma.connection.create({
        data: {
          linkedUserId,
          projectId,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          provider: 'affinity',
        },
      });

      return connection;
    } catch (error) {
      this.logger.error('Error handling OAuth callback for Affinity', error);
      throw new Error('Failed to handle OAuth callback for Affinity');
    }
  }

  async handleTokenRefresh(opts: RefreshParams): Promise<any> {
    const { connectionId, refreshToken } = opts;
    const clientId = this.env.get('AFFINITY_CLIENT_ID');
    const clientSecret = this.env.get('AFFINITY_CLIENT_SECRET');

    try {
      const tokenResponse = await lastValueFrom(this.httpService.post('https://api.affinity.co/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }));

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      await this.prisma.connection.update({
        where: { id: connectionId },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return { access_token, refresh_token, expires_in };
    } catch (error) {
      this.logger.error('Error refreshing token for Affinity', error);
      throw new Error('Failed to refresh token for Affinity');
    }
  }
}
