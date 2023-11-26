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
  async addLinkedUserAndProjectTest() {
    const newOrganization = {
      id_organization: uuidv4(),
      name: 'New Organization',
      stripe_customer_id: 'stripe-customer-123',
    };

    const org = await this.prisma.organizations.create({
      data: newOrganization,
    });
    this.logger.log('Added new organisation ' + org);

    // Example data for a new project
    const newProject = {
      id_project: uuidv4(),
      name: 'New Project',
      id_organization: newOrganization.id_organization,
    };
    const data1 = await this.prisma.projects.create({
      data: newProject,
    });
    this.logger.log('Added new project ' + data1);

    const newLinkedUser = {
      id_linked_user: uuidv4(),
      linked_user_origin_id: '12345',
      alias: 'ACME COMPANY',
      status: 'Active',
      id_project: '1',
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
      const isNotUnique = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      if (isNotUnique)
        throw new NotUniqueRecord(
          `A connection already exists for userId ${linkedUserId} and the provider hubspot`,
        );
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
          id_connection: uuidv4(),
          provider_slug: 'hubspot',
          token_type: 'oauth',
          access_token: encrypt(data.access_token),
          refresh_token: encrypt(data.refresh_token),
          expiration_timestamp: new Date(
            new Date().getTime() + data.expires_in * 1000,
          ),
          created_at: new Date(),
          projects: {
            connect: { id_project: projectId },
          },
          linked_users: {
            connect: { id_linked_user: linkedUserId },
          },
          //id of the end-customer defined in the company application, this is how requests could be made on behlaf of the user
          // without it, we cant retrieve the right row in our db
        },
      });
      this.logger.log('Successfully added tokens inside DB ' + db_res);
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
      console.log('OAuth credentials updated : hubspot ', data);
    } catch (error) {
      handleServiceError(error, this.logger, 'hubspot', Action.oauthRefresh);
    }
  }
}
