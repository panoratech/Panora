import { AuthStrategy, providersConfig } from "./utils";

export type BasicAuthData = {
    USERNAME: string;
    SECRET: string;
    SUBDOMAIN?: string;
};

export type ApiAuthData = {
    API_KEY: string;
    SUBDOMAIN?: string;
}

export type OAuth2AuthData = {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    SCOPE: string;
    SUBDOMAIN?: string;
}

export type AuthData = BasicAuthData | ApiAuthData | OAuth2AuthData

// IMPORTANT ! 
// type is of the form PROVIDERNAME_VERTICALNAME_SOFTWAREMODE_AUTHMODE
// i.e HUBSPOT_CRM_CLOUD_OAUTH 
// i.e ZENDESK_TICKETING_CLOUD_OAUTH

export function extractProvider(type: string): string {
    // Split the string at the first underscore
    const parts = type.split('_');
    // Return the first part of the split string
    return parts[0];
}

export function extractVertical(type: string): string {
    // Split the string at the first underscore
    const parts = type.split('_');
    // Return the second part of the split string
    return parts[1];
}

//TODO: handle software mode 
export function extractSoftwareMode(type: string): string {
    // Split the string at the first underscore
    const parts = type.split('_');
    // Return the first part of the split string
    return parts[2];
}

//TODO: handle software mode 
export function providerToType(providerName: string, vertical: string, authMode: AuthStrategy) {
    switch (authMode) {
        case AuthStrategy.api_key:
            return `${providerName.toUpperCase()}_${vertical.toUpperCase()}_API`
        case AuthStrategy.oauth2:
            return `${providerName.toUpperCase()}_${vertical.toUpperCase()}_OAUTH`
        case AuthStrategy.basic:
            return `${providerName.toUpperCase()}_${vertical.toUpperCase()}_BASIC`
    }
}

export function extractAuthMode(type: string): AuthStrategy {
    // Split the string at the first underscore
    const parts = type.split('_');
    const authMode = parts[parts.length - 1];

    switch (authMode) {
        case 'OAUTH':
            return AuthStrategy.oauth2;
        case 'API':
            return AuthStrategy.api_key;
        case 'BASIC':
            return AuthStrategy.basic;
        default:
            throw new Error("Auth mode not found");
    }
}

export function needsSubdomain(provider: string, vertical: string): boolean {
    // Check if the vertical exists in the config
    if (!providersConfig[vertical]) {
        console.error(`Vertical ${vertical} not found in providersConfig.`);
        return false;
    }

    // Check if the provider exists under the specified vertical
    if (!providersConfig[vertical][provider]) {
        console.error(`Provider ${provider} not found under vertical ${vertical}.`);
        return false;
    }

    // Extract the provider's config
    const providerConfig = providersConfig[vertical][provider];

    // Check if authBaseUrl and apiUrl start with a '/'
    const authBaseUrlStartsWithSlash = providerConfig.authBaseUrl.startsWith('/');
    const apiUrlStartsWithSlash = providerConfig.apiUrl!.startsWith('/');

    // Return true if both URLs start with a '/', otherwise false
    return authBaseUrlStartsWithSlash && apiUrlStartsWithSlash;
}
