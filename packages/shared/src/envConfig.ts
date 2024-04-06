import config from "./config";
import { AuthStrategy, providersConfig } from "./utils";
import axios from 'axios';

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
    SUBDOMAIN?: string;
}

export type AuthData =  BasicAuthData | ApiAuthData | OAuth2AuthData

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
    return parts[0];
}

//TODO: handle software mode 
export function providerToType(providerName: string, vertical: string, authMode: AuthStrategy){
    switch(authMode){
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

    switch(authMode){
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

//TODO: handle software mode
export function getEnvData(provider: string, vertical: string, authStrategy: AuthStrategy){
    let data: AuthData;
    switch (authStrategy) {
        case AuthStrategy.oauth2:
            data = {
                CLIENT_ID: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_CLIENT_ID`]!,
                CLIENT_SECRET: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_CLIENT_SECRET`]!,
            };
            if(needsSubdomain(provider, vertical)){
                data = {
                    ...data,
                    SUBDOMAIN: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_SUBDOMAIN`]!
                }
            }
            return data;
        case AuthStrategy.api_key:
            data = {
                API_KEY: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_API_KEY`]!
            }
            if(needsSubdomain(provider, vertical)){
                data = {
                    ...data,
                    SUBDOMAIN: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_SUBDOMAIN`]!
                }
            }
            return data;
        case AuthStrategy.basic:
            data = {
                USERNAME: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_USERNAME`]!,
                SECRET: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_SECRET`]!
            }
            if(needsSubdomain(provider, vertical)){
                data = {
                    ...data,
                    SUBDOMAIN: process.env[`${provider.toUpperCase()}_${vertical.toUpperCase()}_SUBDOMAIN`]!
                }
            }
            return data;
    }
}

export async function getCustomCredentialsData(projectId: string, type: string, provider: string, vertical: string, authStrategy: AuthStrategy) {
    let body = {
        projectId,
        type,
        attributes: [] as string[]
    }
    let attributes : string[] = [];
    switch (authStrategy) {
        case AuthStrategy.oauth2:
            attributes = ['client_id', 'client_secret'];
            if(needsSubdomain(provider, vertical)){
                attributes.push("subdomain")
            }
            break;
        case AuthStrategy.api_key:
            attributes = ['api_key'];

            if(needsSubdomain(provider, vertical)){
                attributes.push("subdomain")
            }
            break;
        case AuthStrategy.basic:
            attributes = ['username', 'secret'];
            if(needsSubdomain(provider, vertical)){
                attributes.push("subdomain")
            }
            break;
        default:
            break;
    }
    body = {
        ...body,
        attributes
    }
    const res = await axios.post(
        `${config.API_URL}/connections-strategies/get`,  
        JSON.stringify(body),
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
    const values = res.data;
    const data = attributes.reduce((acc, attr, index) => {
        acc[attr] = values[index];
        return acc;
    }, {} as Record<string, string>);
    
    return data as AuthData;
}

export async function getCredentials(projectId: string, type: string) {
    const isCustomCred = await axios.get(`${config.API_URL}/connections-strategies/isCustomCredentials?projectId=${projectId}&type=${type}`);
    const provider = extractProvider(type);
    const vertical = extractVertical(type);
    //const vertical = findProviderVertical(provider);
    if(!vertical) throw new Error(`vertical not found for provider ${provider}`);
    const authStrategy = extractAuthMode(type);
    if(!authStrategy) throw new Error(`auth strategy not found for provider ${provider}`);

    if(isCustomCred.data){
        //customer is using custom credentials (set in the webapp UI)
        //fetch the right credentials
        return await getCustomCredentialsData(projectId, type, provider, vertical, authStrategy)
    }else{
        // type is of form = HUBSPOT_CRM_CLOUD_OAUTH so we must extract the parts
        return getEnvData(provider, vertical, authStrategy);
    }
}