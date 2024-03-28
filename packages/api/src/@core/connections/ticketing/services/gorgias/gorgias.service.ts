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
  GorgiasOAuthResponse,
} from '../../types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class GorgiasConnectionService implements ITicketingConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(GorgiasConnectionService.name);
    this.registry.registerService('gorgias', this);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gorgias',
        },
      });

      //reconstruct the redirect URI that was passed in the githubend it must be the same
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        client_id: this.env.getGorgiasSecret().CLIENT_ID,
        client_secret: this.env.getGorgiasSecret().CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code',
      });
      const subdomain = 'panora';
      const res = await axios.post(
        `https://${subdomain}.gorgias.com/oauth/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: GorgiasOAuthResponse = res.data;
      this.logger.log(
        'OAuth credentials : gorgias ticketing ' + JSON.stringify(data),
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
            account_url: `https://${subdomain}.gorgias.com`,
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
            provider_slug: 'gorgias',
            token_type: 'oauth',
            account_url: `https://${subdomain}.gorgias.com`,
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
              connect: { id_linked_user: linkedUserId },
            },
          },
        });
      }
      return db_res;
    } catch (error) {
      handleServiceError(error, this.logger, 'gorgias', Action.oauthCallback);
    }
  }

  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken } = opts;
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });
      const subdomain = 'panora';
      const res = await axios.post(
        `https://${subdomain}.gorgias.com/oauth/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${this.env.getGorgiasSecret().CLIENT_ID}:${
                this.env.getGorgiasSecret().CLIENT_SECRET
              }`,
            ).toString('base64')}`,
          },
        },
      );
      const data: GorgiasOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : gorgias ');
    } catch (error) {
      handleServiceError(error, this.logger, 'gorgias', Action.oauthRefresh);
    }
  }
}
