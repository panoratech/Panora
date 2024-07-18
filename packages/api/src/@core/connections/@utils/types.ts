export type OAuthCallbackParams = {
  projectId: string;
  linkedUserId: string;
  code: string;
  [key: string]: any;
};

export type APIKeyCallbackParams = {
  projectId: string;
  linkedUserId: string;
  apikey: string;
  body_data?: { [key: string]: any };
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

  redirectUponConnection?(...params: any[]): void;
}
