import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import axios from 'axios';
import {
  CallbackParams,
  HubspotOAuthResponse,
  ICrmConnectionService,
  RefreshParams,
} from '../../types';
import { LoggerService } from '@@core/logger/logger.service';
import { Action, handleServiceError } from '@@core/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceConnectionRegistry } from '../registry.service';

@Injectable()
export class HubspotConnectionService implements ICrmConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
    private registry: ServiceConnectionRegistry,
  ) {
    this.logger.setContext(HubspotConnectionService.name);
    this.registry.registerService('hubspot', this);
  }

  async handleCallback(opts: CallbackParams) {
    try {
      const { linkedUserId, projectId, code } = opts;
      this.logger.log(
        'linkeduserid is ' + linkedUserId + ' inside callback hubspot',
      );
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });
      if (isNotUnique) return;
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'ba591170-a7c7-4fca-8086-1bd178c6b14d', //this.env.getHubspotAuth().CLIENT_ID,
        client_secret: '5553551a-2e5d-49da-a933-35a3d9d9e035', //this.env.getHubspotAuth().CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      });
      const res = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: HubspotOAuthResponse = res.data;
      // save tokens for this customer inside our db
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
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
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
            provider_slug: 'hubspot',
            token_type: 'oauth',
            access_token: this.cryptoService.encrypt(data.access_token),
            refresh_token: this.cryptoService.encrypt(data.refresh_token),
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
      handleServiceError(error, this.logger, 'hubspot', Action.oauthCallback);
    }
  }

  async handleTokenRefresh(opts: RefreshParams) {
    try {
      const { connectionId, refreshToken } = opts;
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`; //tocheck
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.env.getHubspotAuth().CLIENT_ID,
        client_secret: this.env.getHubspotAuth().CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: this.cryptoService.decrypt(refreshToken),
      });
      const res = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: HubspotOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: this.cryptoService.encrypt(data.access_token),
          refresh_token: this.cryptoService.encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
        },
      });
      this.logger.log('OAuth credentials updated : hubspot ');
    } catch (error) {
      handleServiceError(error, this.logger, 'hubspot', Action.oauthRefresh);
    }
  }
}
