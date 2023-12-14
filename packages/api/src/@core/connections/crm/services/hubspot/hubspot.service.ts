import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import axios from 'axios';
import config from '@@core/utils/config';
import { HubspotOAuthResponse } from '../../types';
import { LoggerService } from '@@core/logger/logger.service';
import {
  Action,
  NotUniqueRecord,
  handleServiceError,
} from '@@core/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { decrypt, encrypt } from '@@core/utils/crypto';

@Injectable()
export class HubspotConnectionService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(HubspotConnectionService.name);
  }

  async handleHubspotCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
  ) {
    try {
      this.logger.log('linkeduserid is ' + linkedUserId);
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });

      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
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
      const db_res = await this.prisma.connections.upsert({
        where: {
          id_connection: isNotUnique.id_connection,
        },
        create: {
          id_connection: uuidv4(),
          provider_slug: 'hubspot',
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
      this.logger.log('Successfully added tokens inside DB ' + db_res);
      return db_res;
    } catch (error) {
      handleServiceError(error, this.logger, 'hubspot', Action.oauthCallback);
    }
  }

  async handleHubspotTokenRefresh(connectionId: string, refresh_token: string) {
    try {
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`; //tocheck
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: decrypt(refresh_token),
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
          access_token: encrypt(data.access_token),
          refresh_token: encrypt(data.refresh_token),
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
