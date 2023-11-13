import { Injectable } from '@nestjs/common';
import axios from 'axios';
import config from 'src/@core/utils/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { ZendeskOAuthResponse } from '../../types';
@Injectable()
export class ZendeskConnectionService {
  constructor(private prisma: PrismaService) {}

  async handleZendeskCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
  ) {
    try {
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`;

      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      });
      const res = await axios.post(
        'https://api.getbase.com/oauth2/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${config.ZENDESK_CLIENT_ID}:${config.ZENDESK_CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      //TODO: handle if res throws an error
      const data: ZendeskOAuthResponse = res.data;
      console.log('OAuth credentials : zendesk ', data);
      // save tokens for this customer inside our db
      //TODO: encrypt the access token and refresh tokens
      const db_res = await this.prisma.connections.create({
        data: {
          provider_slug: 'zendesk',
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
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        console.error('Error with Axios request:', error.response?.data);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Error with Prisma request:', error);
      }
      console.log(error);
    }
  }
  async handleZendeskTokenRefresh(connectionId: bigint, refresh_token: string) {
    try {
      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      });
      const res = await axios.post(
        'https://api.getbase.com/oauth2/token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${config.ZENDESK_CLIENT_ID}:${config.ZENDESK_CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      const data: ZendeskOAuthResponse = res.data;
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
      console.log('OAuth credentials updated : zendesk ', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        console.error('Error with Axios request:', error.response?.data);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Error with Prisma request:', error);
      }
      console.log(error);
    }
  }
}
