export enum AuthStrategy {
    oauth2 = '0Auth2',
    api_key = 'API Key',
    basic = 'Basic Auth'
}
  
export enum SoftwareMode {
    cloud = 'CLOUD',
}

export type ProviderConfig = {
    scopes?: string;
    logoPath: string;
    description: string;
    active?: boolean;
    customPropertiesUrl?: string;
    authStrategy?: AuthStrategy;
    urls: {
        docsUrl: string;
        apiUrl: string;
        authBaseUrl?: string; // url used to authorize an application on behalf of the user (only when authStrategy is oauth2)
        customPropertiesUrl?: string;
    };
    options?: {
        local_redirect_uri_in_https?: boolean; // true if an https url is needed when creating oauth2 app in local for testing
    };
    realTimeWebhookMetadata?: {
        method?: 'API' | 'MANUAL';
        events?: string[];
    }
};

export type VerticalConfig = {
    [key: string]: ProviderConfig;
};

export type ProvidersConfig = {
    [vertical: string]: VerticalConfig;
}
