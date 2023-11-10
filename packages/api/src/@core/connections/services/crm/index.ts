import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  HubspotOAuthResponse,
  PipeDriveOAuthResponse,
  ZendeskOAuthResponse,
  ZohoOAuthResponse,
} from './types';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import config from 'src/@core/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class CrmConnectionsService {
  constructor(private prisma: PrismaService) {}

  async handleHubspotCallback(
    customerId: string,
    projectId: string,
    code: string,
  ) {
    try {
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
          id_project: Number(projectId),
          id_end_customer: customerId,
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
  async handleZohoCallback(
    customerId: string,
    projectId: string,
    code: string,
    accountURL: string,
  ) {
    try {
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/oauth/crm/callback`; // TODO;

      const formData = {
        grant_type: 'authorization_code',
        client_id: config.ZOHOCRM_CLIENT_ID,
        client_secret: config.ZOHOCRM_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      };
      const res = await axios.post(
        `https://${accountURL}/oauth/v2/token`,
        formData,
      );
      //TODO: handle if res throws an error
      const data: ZohoOAuthResponse = res.data;
      console.log('OAuth credentials : zoho ', data);
      // save tokens for this customer inside our db
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
          id_project: Number(projectId),
          id_end_customer: customerId,
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
  async handlePipedriveCallback(
    customerId: string,
    projectId: string,
    code: string,
  ) {
    try {
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/oauth/crm/callback`; // TODO;

      const formData = {
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      };
      const res = await axios.post(
        'https://oauth.pipedrive.com/oauth/token',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Basic ${Buffer.from(
              `${config.PIPEDRIVE_CLIENT_ID}:${config.PIPEDRIVE_CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      //TODO: handle if res throws an error
      const data: PipeDriveOAuthResponse = res.data;
      console.log('OAuth credentials : pipedrive ', data);
      // save tokens for this customer inside our db
      //TODO: encrypt the access token and refresh tokens
      const db_res = await this.prisma.connections.create({
        data: {
          provider_slug: 'pipedrive',
          token_type: 'oauth',
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
          id_project: Number(projectId),
          id_end_customer: customerId,
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
  //TODO: later
  async handleFreshsalesCallback() {
    return;
  }
  async handleZendeskCallback(
    customerId: string,
    projectId: string,
    code: string,
  ) {
    try {
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/oauth/crm/callback`; // TODO;

      const formData = {
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      };
      const res = await axios.post(
        'https://api.getbase.com/oauth2/token',
        formData,
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
          id_project: Number(projectId),
          id_end_customer: customerId,
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
}
