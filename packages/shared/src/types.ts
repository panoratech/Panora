export enum AuthStrategy {
    oauth2 = '0Auth2',
    api_key = 'API Key',
    basic = 'Basic Auth'
}

export type AuthType = {
    strategy: AuthStrategy;
    properties?: string[]; // for api key it is needed to know what is asked e.g apikey, usertoken etc
}
export enum SoftwareMode {
    cloud = 'CLOUD',
}

export type StringAuthorization = string;
export type DynamicAuthorization = ((...args: string[]) => string);
export type StaticApiUrl = string;
export type DynamicApiUrl = ((...args: string[]) => string);

export type ProviderConfig = {
    scopes?: string;
    logoPath: string;
    description: string;
    active?: boolean;
    customPropertiesUrl?: string;
    authStrategy: AuthType;
    urls: {
        docsUrl: string;
        apiUrl: StaticApiUrl | DynamicApiUrl;
        authBaseUrl?: StringAuthorization | DynamicAuthorization; // url used to authorize an application on behalf of the user (only when authStrategy is oauth2)
        customPropertiesUrl?: string;
    };
    options?: {
        // the Oauth flow is tricky sometimes, either end_user_domain or company_subdomain can be asked
        end_user_domain?: boolean; // subdomain of the end-user connecting his account for the integration
        company_subdomain?: boolean; // subdomain of the company that embeds the integration for its end-users
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
