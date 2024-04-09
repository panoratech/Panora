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
import { OAuth2AuthData, providerToType } from '@panora/shared';
import { AuthStrategy } from '@panora/shared';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

type AcceloOAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  error: string;
  error_description: string;
};

@Injectable()
export class AcceloConnectionService implements ICrmConnectionService {
  private readonly type: string;

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
    private cService: ConnectionsStrategiesService,
  ) {
    this.logger.setContext(AcceloConnectionService.name);
    this.registry.registerService('accelo', this);
    this.type = providerToType('accelo', 'crm', AuthStrategy.oauth2);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      this.logger.log(
        'linkeduserid is ' + linkedUserId + ' inside callback accelo',
      );
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'accelo',
          vertical: 'crm',
        },
      });
      if (isNotUnique) return;
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
      });
      //const subdomain = 'panora'; //TODO: if custom oauth then get the actual domain from customer
      const res = await axios.post(
        `${CREDENTIALS.SUBDOMAIN}/oauth2/v0/token`,
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

      const data: AcceloOAuthResponse = res.data;

      // Saving the token of customer inside db
      let db_res;
      const connection_token = uuidv4();

      if (isNotUnique) {
        // Update existing connection
        db_res = await this.prisma.connections.update({
          where: {
            id_connection: isNotUnique.id_connection,
          },
          data: {
            access_token: this.cryptoService.encrypt(data.access_token),
            account_url: CREDENTIALS.SUBDOMAIN!,
            expiration_timestamp: new Date(
              new Date().getTime() + data.expires_in * 1000,
            ),
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
            provider_slug: 'accelo',
            vertical: 'crm',
            token_type: 'oauth',
            account_url: CREDENTIALS.SUBDOMAIN!,
            access_token: this.cryptoService.encrypt(data.access_token),
            expiration_timestamp: new Date(
              new Date().getTime() + data.expires_in * 1000,
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
      this.logger.log('Successfully added tokens inside DB ' + db_res);
      return db_res;
    } catch (error) {
      handleServiceError(error, this.logger, 'accelo', Action.oauthCallback);
    }
  }

  // It is not required for Accelo as it does not provide refresh_token
  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken, projectId } = opts;
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });
      //const subdomain = 'panora'; //TODO: if custom oauth then get the actual domain from customer
      const CREDENTIALS = (await this.cService.getCredentials(
        projectId,
        this.type,
      )) as OAuth2AuthData;

      const res = await axios.post(
        `${CREDENTIALS.SUBDOMAIN!}/oauth2/v0/token`,
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
      const data: AcceloOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : accelo ');
    } catch (error) {
      handleServiceError(error, this.logger, 'accelo', Action.oauthRefresh);
    }
  }
}
