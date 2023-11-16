import { Injectable } from '@nestjs/common';
import axios from 'axios';
import config from 'src/@core/utils/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { ZohoOAuthResponse } from '../../types';
import { LoggerService } from 'src/@core/logger/logger.service';
import {
  Action,
  NotUniqueRecord,
  handleServiceError,
} from 'src/@core/utils/errors';

const ZOHOLocations = {
  us: 'https://accounts.zoho.com',
  eu: 'https://accounts.zoho.eu',
  in: 'https://accounts.zoho.in',
  au: 'https://accounts.zoho.com.au',
  jp: 'https://accounts.zoho.jp',
};
@Injectable()
export class ZohoConnectionService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ZohoConnectionService.name);
  }
  async handleZohoCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
    zohoLocation: string,
  ) {
    try {
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: BigInt(linkedUserId),
        },
      });
      if (isNotUnique)
        throw new NotUniqueRecord(
          `A connection already exists for userId ${linkedUserId} and the provider zoho`,
        );
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.ZOHOCRM_CLIENT_ID,
        client_secret: config.ZOHOCRM_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      });
      const domain = ZOHOLocations[zohoLocation];
      const res = await axios.post(
        `${domain}/oauth/v2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZohoOAuthResponse = res.data;
      console.log('OAuth credentials : zoho ', data);
      //TODO: encrypt the access token and refresh tokens
      const db_res = await this.prisma.connections.create({
        data: {
          provider_slug: 'zoho',
          token_type: 'oauth',
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
          created_at: new Date(),
          projects: {
            connect: { id_project: BigInt(projectId) },
          },
          linked_users: {
            connect: { id_linked_user: BigInt(linkedUserId) },
          },
          account_url: domain,
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger, 'zoho', Action.oauthCallback);
    }
  }
  async handleZohoTokenRefresh(
    connectionId: bigint,
    refresh_token: string,
    domain: string,
  ) {
    try {
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: refresh_token,
      });
      const res = await axios.post(
        `${domain}/oauth/v2/token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const data: ZohoOAuthResponse = res.data;
      await this.prisma.connections.update({
        where: {
          id_connection: connectionId,
        },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
        },
      });
      console.log('OAuth credentials updated : zoho ', data);
    } catch (error) {
      handleServiceError(error, this.logger, 'zoho', Action.oauthRefresh);
    }
  }
}
