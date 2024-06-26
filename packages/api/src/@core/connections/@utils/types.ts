type CommonCallbackParams = {
  projectId: string;
  linkedUserId: string;
};

export type APIKeyCallbackParams = CommonCallbackParams & {
  apikey: string;
  body_data?: { [key: string]: any };
};

// Define the specific callback parameters for OAUTH
export type OAuthCallbackParams = CommonCallbackParams & {
  code: string;
  location?: string; // for zoho
};

// Define the discriminated union type for callback parameters
export type CallbackParams = APIKeyCallbackParams | OAuthCallbackParams;

export type RefreshParams = {
  connectionId: string;
  refreshToken: string;
  account_url?: string;
  projectId: string;
};

export interface IConnectionCategory {
  handleCallBack(
    providerName: string,
    callbackOpts: CallbackParams,
    type_strategy: 'oauth' | 'apikey' | 'basic',
  ): Promise<void>;

  handleTokensRefresh(
    connectionId: string,
    providerName: string,
    refresh_token: string,
    id_project: string,
    account_url?: string,
  ): Promise<void>;
}
