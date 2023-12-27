import { connections as Connection } from '@prisma/client';

export type CallbackParams = {
  linkedUserId: string;
  projectId: string;
  code: string;
  location?: string; //for zoho
};

export type RefreshParams = {
  connectionId: string;
  refreshToken: string;
  account_url?: string;
};
export interface ICrmConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh(opts: RefreshParams): Promise<any>;
}
export interface HubspotOAuthResponse {
  refresh_token: string;
  access_token: string;
  expires_in: number;
}
export interface ZohoOAuthResponse {
  access_token: string;
  refresh_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export interface PipeDriveOAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  scope: string[];
  expires_in: number;
  api_domain: string;
}

//Sell is the Zendesk CRM name
export interface ZendeskSellOAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
}
