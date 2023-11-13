import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import axios from 'axios';
import config from 'src/@core/utils/config';
import { Prisma } from '@prisma/client';
import { HubspotOAuthResponse } from '../../types';
import { LoggerService } from 'src/@core/logger/logger.service';

@Injectable()
export class HubspotConnectionService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(HubspotConnectionService.name);
  }
  async addLinkedUserAndProjectTest() {
    // Adding a new organization
    const newOrganization = {
      name: 'New Organization',
      stripe_customer_id: 'stripe-customer-123',
    };

    const org = await this.prisma.organizations.create({
      data: newOrganization,
    });
    this.logger.log('Added new organisation ' + org);

    // Example data for a new project
    const newProject = {
      name: 'New Project',
      id_organization: 1n, // bigint value
    };
    const data1 = await this.prisma.projects.create({
      data: newProject,
    });
    this.logger.log('Added new project ' + data1);

    const newLinkedUser = {
      linked_user_origin_id: '12345',
      alias: 'ACME COMPANY',
      status: 'Active',
      id_project: 1n, // bigint value
    };
    const data = await this.prisma.linked_users.create({
      data: newLinkedUser,
    });
    this.logger.log('Added new linked_user ' + data);
  }

  async handleHubspotCallback(
    linkedUserId: string,
    projectId: string,
    code: string,
  ) {
    try {
      //TMP STEP = first create a linked_user and a project id
      await this.addLinkedUserAndProjectTest();
      //reconstruct the redirect URI that was passed in the frontend it must be the same
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`; //tocheck
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
      //console.log('OAuth credentials : hubspot ', data);
      this.logger.log('OAuth credentials : hubspot ' + data);
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
      this.logger.log('Successfully added tokens inside DB ' + db_res);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        //console.error('Error with Axios request:', error.response?.data);
        this.logger.error('Error with Axios request:', error.response?.data);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        //console.error('Error with Prisma request:', error);
        this.logger.error('Error with Prisma request:', error.message);
      }
      this.logger.error(
        'An error occurred...',
        error.response?.data || error.message,
      );
    }
  }
  async handleHubspotTokenRefresh(connectionId: bigint, refresh_token: string) {
    try {
      const REDIRECT_URI = `${config.OAUTH_REDIRECT_BASE}/connections/oauth/callback`; //tocheck

      const formData = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.HUBSPOT_CLIENT_ID,
        client_secret: config.HUBSPOT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: refresh_token,
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
