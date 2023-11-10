import { Injectable } from '@nestjs/common';
import { CrmConnectionsService } from './crm/crm-connection.service';
import { NotFoundError } from 'src/@core/utils/errors';

@Injectable()
export class ConnectionsService {
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
  constructor(private crmConnectionService: CrmConnectionsService) {}

  async handleCRMCallBack(
    projectId: string,
    linkedUserId: string,
    providerName: string,
    code: string,
    zohoAccountURL?: string,
  ) {
    try {
      switch (providerName) {
        case 'hubspot':
          if (!code) {
            throw new NotFoundError('no hubspot code found');
          }
          return this.crmConnectionService.handleHubspotCallback(
            linkedUserId,
            projectId,
            code,
          );
        case 'zoho':
          if (!code || !zohoAccountURL) {
            throw new NotFoundError('no zoho code/ zoho AccountURL found');
          }
          return this.crmConnectionService.handleZohoCallback(
            linkedUserId,
            projectId,
            code,
            zohoAccountURL,
          );
        case 'pipedrive':
          if (!code) {
            throw new NotFoundError('no pipedrive code found');
          }
          return this.crmConnectionService.handlePipedriveCallback(
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
          return this.crmConnectionService.handleZendeskCallback(
            linkedUserId,
            projectId,
            code,
          );
        default:
          return;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log(error);
      }
      return error;
    }
  }

  async handleCRMTokensRefresh(
    connectionId: bigint,
    providerId: string,
    refresh_token: string,
    account_url?: string,
  ) {
    try {
      switch (providerId) {
        case 'hubspot':
          return this.crmConnectionService.handleHubspotTokenRefresh(
            connectionId,
            refresh_token,
          );
        case 'zoho':
          return this.crmConnectionService.handleZohoTokenRefresh(
            connectionId,
            refresh_token,
            account_url,
          );
        case 'pipedrive':
          return this.crmConnectionService.handlePipedriveTokenRefresh(
            connectionId,
            refresh_token,
          );
        case 'freshsales':
          //todo: LATER
          break;
        case 'zendesk':
          return this.crmConnectionService.handleZendeskTokenRefresh(
            connectionId,
            refresh_token,
          );
        default:
          return;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log(error);
      }
      return error;
    }
  }
}
