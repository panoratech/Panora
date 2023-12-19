import { Injectable } from '@nestjs/common';
import { ZohoConnectionService } from './zoho/zoho.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { HubspotConnectionService } from './hubspot/hubspot.service';
import { PipedriveConnectionService } from './pipedrive/pipedrive.service';
import { ZendeskConnectionService } from './zendesk/zendesk.service';
import { FreshsalesConnectionService } from './freshsales/freshsales.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { connections as Connection } from '@prisma/client';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CrmConnectionsService {
  constructor(
    private zohoConnectionService: ZohoConnectionService,
    private hubspotConnectionService: HubspotConnectionService,
    private pipedriveConnectionService: PipedriveConnectionService,
    private zendeskConnectionService: ZendeskConnectionService,
    private freshsalesConnectionService: FreshsalesConnectionService,
    private webhook: WebhookService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(CrmConnectionsService.name);
  }
  //STEP 1:[FRONTEND STEP]
  //create a frontend SDK snippet in which an authorization embedded link is set up  so when users click
  // on it to grant access => they grant US the access and then when confirmed
  /*const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;*/ //oauth/callback

  // oauth server calls this redirect callback
  // WE WOULD HAVE CREATED A DEV ACCOUNT IN THE 5 CRMs (Panora dev account)
  // we catch the tmp token and swap it against oauth2 server for access/refresh tokens
  // to perform actions on his behalf
  // this call pass 1. integrationID 2. CustomerId 3. Panora Api Key
  async handleCRMCallBack(
    projectId: string,
    linkedUserId: string,
    providerName: string,
    code: string,
    zohoLocation?: string,
  ) {
    try {
      let data: Connection;
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'connection.created',
          method: 'GET',
          url: '/oauth/callback',
          provider: providerName.toLowerCase(),
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      switch (providerName.toLowerCase()) {
        case 'hubspot':
          if (!code) {
            throw new NotFoundError(`no hubspot code found, found ${code}`);
          }
          data = await this.hubspotConnectionService.handleHubspotCallback(
            linkedUserId,
            projectId,
            code,
          );
          break;
        case 'zoho':
          if (!code) {
            throw new NotFoundError(`no zoho code, found ${code}`);
          }
          if (!zohoLocation) {
            throw new NotFoundError(`no zoho location, found ${code}`);
          }
          data = await this.zohoConnectionService.handleZohoCallback(
            linkedUserId,
            projectId,
            code,
            zohoLocation,
          );
          break;
        case 'pipedrive':
          if (!code) {
            throw new NotFoundError(`no pipedrive code found, found ${code}`);
          }
          data = await this.pipedriveConnectionService.handlePipedriveCallback(
            linkedUserId,
            projectId,
            code,
          );
          break;
        case 'freshsales':
          //todo: LATER
          break;
        case 'zendesk':
          if (!code) {
            throw new NotFoundError(`no zendesk code found, found ${code}`);
          }
          data = await this.zendeskConnectionService.handleZendeskCallback(
            linkedUserId,
            projectId,
            code,
          );
          break;
        default:
          throw new NotFoundError(`Unknown provider, found ${providerName}`);
      }
      await this.prisma.events.update({
        where: {
          id_event: job_resp_create.id_event,
        },
        data: {
          status: 'success',
        },
      });
      await this.webhook.handleWebhook(
        data,
        'connection.created',
        projectId,
        job_resp_create.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async handleCRMTokensRefresh(
    connectionId: string,
    providerId: string,
    refresh_token: string,
    account_url?: string,
  ) {
    try {
      switch (providerId.toLowerCase()) {
        case 'hubspot':
          return this.hubspotConnectionService.handleHubspotTokenRefresh(
            connectionId,
            refresh_token,
          );
        case 'zoho':
          return this.zohoConnectionService.handleZohoTokenRefresh(
            connectionId,
            refresh_token,
            account_url,
          );
        case 'pipedrive':
          return this.pipedriveConnectionService.handlePipedriveTokenRefresh(
            connectionId,
            refresh_token,
          );
        case 'freshsales':
          //todo: LATER
          break;
        case 'zendesk':
          return this.zendeskConnectionService.handleZendeskTokenRefresh(
            connectionId,
            refresh_token,
          );
        default:
          throw new NotFoundError(`Unknown provider, found ${providerId}`);
      }
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
