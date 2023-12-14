import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import axios from 'axios';
import config from '@@core/utils/config';
import { PipeDriveOAuthResponse } from '../../types';
import {
  Action,
  NotUniqueRecord,
  handleServiceError,
} from '@@core/utils/errors';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { decrypt, encrypt } from '@@core/utils/crypto';

@Injectable()
export class PipedriveConnectionService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
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
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;

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
              `${config.PIPEDRIVE_CLIENT_ID}:${config.PIPEDRIVE_CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      const data: PipeDriveOAuthResponse = res.data;
      this.logger.log('OAuth credentials : pipedrive ');
      const db_res = await this.prisma.connections.upsert({
        where: {
          id_connection: isNotUnique.id_connection,
        },
        create: {
          id_connection: uuidv4(),
          provider_slug: 'pipedrive',
          token_type: 'oauth',
          access_token: encrypt(data.access_token),
          refresh_token: encrypt(data.refresh_token),
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
        update: {
          access_token: encrypt(data.access_token),
          refresh_token: encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
          status: 'valid',
          created_at: new Date(),
        },
      });
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
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        redirect_uri: REDIRECT_URI,
        refresh_token: decrypt(refresh_token),
      });
      const res = await axios.post(
        'https://oauth.pipedrive.com/oauth/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${config.PIPEDRIVE_CLIENT_ID}:${config.PIPEDRIVE_CLIENT_SECRET}`,
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
          access_token: encrypt(data.access_token),
          refresh_token: encrypt(data.refresh_token),
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
