import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import axios from 'axios';
import { PipeDriveOAuthResponse } from '../../types';
import { Action, handleServiceError } from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Injectable()
export class PipedriveConnectionService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private env: EnvironmentService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(PipedriveConnectionService.name);
  }

  async handlePipedriveCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
  ) {
    try {
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });

      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      });
      const res = await axios.post(
        'https://oauth.pipedrive.com/oauth/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${this.env.getPipedriveSecret().CLIENT_ID}:${
                this.env.getPipedriveSecret().CLIENT_SECRET
              }`,
            ).toString('base64')}`,
          },
        },
      );
      const data: PipeDriveOAuthResponse = res.data;
      this.logger.log('OAuth credentials : pipedrive ');
      let db_res;

      if (isNotUnique) {
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
        db_res = await this.prisma.connections.create({
          data: {
            id_connection: uuidv4(),
            provider_slug: 'pipedrive',
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
      return db_res;
    } catch (error) {
      handleServiceError(error, this.logger, 'pipedrive', Action.oauthCallback);
    }
  }

  async handlePipedriveTokenRefresh(
    connectionId: string,
    refresh_token: string,
  ) {
    try {
      const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        redirect_uri: REDIRECT_URI,
        refresh_token: this.cryptoService.decrypt(refresh_token),
      });
      const res = await axios.post(
        'https://oauth.pipedrive.com/oauth/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${this.env.getPipedriveSecret().CLIENT_ID}:${
                this.env.getPipedriveSecret().CLIENT_SECRET
              }`,
            ).toString('base64')}`,
          },
        },
      );
      const data: PipeDriveOAuthResponse = res.data;
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
      this.logger.log('OAuth credentials updated : pipedrive ');
    } catch (error) {
      handleServiceError(error, this.logger, 'pipedrive', Action.oauthRefresh);
    }
  }
}
