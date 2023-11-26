import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { ZohoConnectionService } from './zoho/zoho.service';
import { NotFoundError } from 'src/@core/utils/errors';
import { HubspotConnectionService } from './hubspot/hubspot.service';
import { PipedriveConnectionService } from './pipedrive/pipedrive.service';
import { ZendeskConnectionService } from './zendesk/zendesk.service';
import { FreshsalesConnectionService } from './freshsales/freshsales.service';
import { LoggerService } from 'src/@core/logger/logger.service';

@Injectable()
export class CrmConnectionsService {
  constructor(
    private zohoConnectionService: ZohoConnectionService,
    private hubspotConnectionService: HubspotConnectionService,
    private pipedriveConnectionService: PipedriveConnectionService,
    private zendeskConnectionService: ZendeskConnectionService,
    private freshsalesConnectionService: FreshsalesConnectionService,
    private logger: LoggerService,
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
    switch (providerName) {
      case 'hubspot':
        if (!code) {
          throw new NotFoundError('no hubspot code found');
        }
        return this.hubspotConnectionService.handleHubspotCallback(
          linkedUserId,
          projectId,
          code,
        );
      case 'zoho':
        if (!code) {
          throw new NotFoundError('no zoho code');
        }
        if (!zohoLocation) {
          throw new NotFoundError('no zoho location');
        }
        return this.zohoConnectionService.handleZohoCallback(
          linkedUserId,
          projectId,
          code,
          zohoLocation,
        );
      case 'pipedrive':
        if (!code) {
          throw new NotFoundError('no pipedrive code found');
        }
        return this.pipedriveConnectionService.handlePipedriveCallback(
          linkedUserId,
          projectId,
          code,
        );
      case 'freshsales':
        //todo: LATER
        break;
      case 'zendesk':
        if (!code) {
          throw new NotFoundError('no zendesk code found');
        }
        return this.zendeskConnectionService.handleZendeskCallback(
          linkedUserId,
          projectId,
          code,
        );
      default:
        return;
    }
  }

  async handleCRMTokensRefresh(
    connectionId: string,
    providerId: string,
    refresh_token: string,
    account_url?: string,
  ) {
    switch (providerId) {
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
        return;
    }
  }
}
