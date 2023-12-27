import { connections as Connection } from '@prisma/client';

export interface ZendeskTicketingOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
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
