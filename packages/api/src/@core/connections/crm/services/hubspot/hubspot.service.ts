import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import axios from 'axios';
import config from 'src/@core/utils/config';
import { Prisma } from '@prisma/client';
import { HubspotOAuthResponse } from '../../types';

@Injectable()
export class HubspotConnectionService {
  constructor(private prisma: PrismaService) {}

  async handleHubspotCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
  ) {
    try {
      //first create a linked_user
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/oauth/crm/callback`; //tocheck

      const formData = {
        grant_type: 'authorization_code',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      };
      const res = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        formData,
      );
      const data: HubspotOAuthResponse = res.data;
      console.log('OAuth credentials : hubspot ', data);
      // save tokens for this customer inside our db
      //TODO: encrypt the access token and refresh tokens
      const db_res = await this.prisma.connections.create({
        data: {
          provider_slug: 'hubspot',
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
          //id of the end-customer defined in the company application, this is how requests could be made on behlaf of the user
          // without it, we cant retrieve the right row in our db
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
  async handleHubspotTokenRefresh(connectionId: bigint, refresh_token: string) {
    try {
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/oauth/crm/callback`;

      const formData = {
        grant_type: 'refresh_token',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: refresh_token,
      };
      const res = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        formData,
      );
      const data: HubspotOAuthResponse = res.data;
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
      console.log('OAuth credentials updated : hubspot ', data);
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
