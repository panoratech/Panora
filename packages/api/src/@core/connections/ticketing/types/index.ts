import { connections as Connection } from '@prisma/client';

export interface JiraCloudIdInformation {
  id: string;
  name: string;
  url: string;
  scopes: Array<string>;
  avatarUrl: string;
}

export interface ZendeskTicketingOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
export interface FrontOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
}

export interface GithubOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  refresh_token_expires_in: string; //TODO
  token_type: string;
  scope: string;
}

export interface GorgiasOAuthResponse {
  access_token: string;
  expires_in: 0;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface JiraOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number | Date;
  scope: string;
}

export interface ClickupOAuthResponse {
  access_token: string;
}

export interface GitlabOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  created_at: number;
}
export interface LinearOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
export interface JiraServiceManagementOAuthResponse {
  access_token: string;
}

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
export interface ITicketingConnectionService {
  handleCallback(opts: CallbackParams): Promise<Connection>;
  handleTokenRefresh(opts: RefreshParams): Promise<any>;
}
