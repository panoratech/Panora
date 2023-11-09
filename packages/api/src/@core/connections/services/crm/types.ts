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

export interface ZendeskOAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
}
