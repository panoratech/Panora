import { CONNECTORS_METADATA } from './connectors/metadata';
import { needsEndUserSubdomain, needsScope, needsSubdomain, OAuth2AuthData, providerToType } from './envConfig';
import { AuthStrategy, DynamicAuthorization, ProviderConfig, StringAuthorization } from './types';
import { randomString } from './utils';
import * as crypto from 'crypto';

interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
  vertical: string;
  redirectUriIngress?: {
    status: boolean;
    value: string | null;
  };
  additionalParams?: {
    end_user_domain: string; // needed for instance with shopify or sharepoint to construct the auth domain
  }
}

function generateCodes() {
  const base64URLEncode = (str: Buffer): string => {
      return str.toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
  }

  const verifier = base64URLEncode(crypto.randomBytes(32));

  const sha256 = (buffer: Buffer): Buffer => {
      return crypto.createHash('sha256').update(buffer).digest();
  }

  const challenge = base64URLEncode(sha256(Buffer.from(verifier)));

  return {
      codeVerifier: verifier,
      codeChallenge: challenge
  }
}

// make sure to check wether its api_key or oauth2 to build the right auth
// make sure to check if client has own credentials to connect or panora managed ones
export const constructAuthUrl = async ({ projectId, linkedUserId, providerName, returnUrl, apiUrl, vertical, additionalParams, redirectUriIngress }: AuthParams) => {
  const config = CONNECTORS_METADATA[vertical.toLowerCase()][providerName];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }
  let baseRedirectURL = apiUrl;
  // We check if https is needed in local if yes we take the ingress setup in .env   and passed through redirectUriIngress
  if (config.options && config.options.local_redirect_uri_in_https === true && redirectUriIngress && redirectUriIngress.status === true) {
    baseRedirectURL = redirectUriIngress.value!;
  }
  const encodedRedirectUrl = encodeURIComponent(`${baseRedirectURL}/connections/oauth/callback`); 
  let state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  if (providerName === 'microsoftdynamicssales') {
    state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl, resource: additionalParams!.end_user_domain }));
  }
  if (providerName === 'deel') {
    const randomState = randomString();
    state = encodeURIComponent(randomState + 'deel_delimiter' + Buffer.from(JSON.stringify({
      projectId,
      linkedUserId,
      providerName,
      vertical,
      returnUrl,
      resource: additionalParams!.end_user_domain!
    })).toString('base64'));
  }
  if (providerName === 'squarespace') {
    const randomState = randomString();
    state = encodeURIComponent(randomState + 'squarespace_delimiter' + Buffer.from(JSON.stringify({
      projectId,
      linkedUserId,
      providerName,
      vertical,
      returnUrl,
      resource: additionalParams!.end_user_domain!
    })).toString('base64'));
  }
  // console.log('State : ', JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  // console.log('encodedRedirect URL : ', encodedRedirectUrl); 
  // const vertical = findConnectorCategory(providerName);
  if (vertical === null) { 
    throw new ReferenceError('vertical is null');
  }
  const authStrategy = config.authStrategy!.strategy;

  switch (authStrategy) {
    case AuthStrategy.oauth2:
      return handleOAuth2Url({
        providerName,
        vertical,
        authStrategy,
        projectId,
        config,
        encodedRedirectUrl,
        state,
        apiUrl,
        additionalParams
      });
    case AuthStrategy.api_key:
      return handleApiKeyUrl();
    case AuthStrategy.basic:
      return handleBasicUrl();
  }
};

interface HandleOAuth2Url {
  providerName: string;
  vertical: string;
  authStrategy: AuthStrategy;
  projectId: string;
  config: ProviderConfig;
  encodedRedirectUrl: string;
  state: string;
  apiUrl: string;
  additionalParams?: {
    end_user_domain: string; // needed for instance with shopify or sharepoint to construct the auth domain
  }
}

const handleOAuth2Url = async (input: HandleOAuth2Url) => {
  const {
    providerName,
    vertical,
    authStrategy,
    projectId,
    config,
    encodedRedirectUrl,
    state,
    apiUrl ,
    additionalParams,
  } = input;

  const type = providerToType(providerName, vertical, authStrategy); 
  
  // 1. env if selfhost and no custom
  // 2. backend if custom credentials
  // same for authBaseUrl with subdomain
  const DATA = await fetch(`${apiUrl}/connection_strategies/getCredentials?projectId=${projectId}&type=${type}`);
  const data = await DATA.json() as OAuth2AuthData; 

  // console.log("Fetched Data ", JSON.stringify(data))

  const clientId = data.CLIENT_ID;
  if (!clientId) throw new ReferenceError(`No client id for type ${type}`)
  const scopes = data.SCOPE;

  const { urls: urls } = config;
  const { authBaseUrl: baseUrl } = urls;

  if (!baseUrl) throw new ReferenceError(`No authBaseUrl found for type ${type}`)

  let BASE_URL: string;
  // construct the baseAuthUrl based on the fact that client may use custom subdomain
  if( needsSubdomain(providerName, vertical) ) {
    if (typeof baseUrl === 'string') {
      BASE_URL = baseUrl;
    } else {
      BASE_URL = (baseUrl as DynamicAuthorization)(data.SUBDOMAIN as string);
    }
  } else if (needsEndUserSubdomain(providerName, vertical)) {
    if (typeof baseUrl === 'string') {
      BASE_URL = baseUrl;
    } else {
      BASE_URL = (baseUrl as DynamicAuthorization)(additionalParams!.end_user_domain);
    }
  } else {
    BASE_URL = baseUrl as StringAuthorization;
  }

  // console.log('BASE URL IS '+ BASE_URL)
  if (!baseUrl || !BASE_URL) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  // Default URL structure
  let params = `response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;

  if (providerName === 'helpscout') {
    params = `client_id=${encodeURIComponent(clientId)}&state=${state}`;
  }
  if (providerName === 'pipedrive' || providerName === 'shopify' || providerName === 'squarespace') {
    params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;
  }
  if (providerName === 'faire') {
    params = `applicationId=${encodeURIComponent(clientId)}&redirectUrl=${encodedRedirectUrl}&state=${state}`;
  }
  if (providerName === 'ebay') {
    params = `response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${data.RUVALUE}&state=${state}`;
  }
  if (providerName === 'amazon') {
    params = `application_id=${encodeURIComponent(data.APPLICATION_ID)}&state=${state}&version=beta`;
  }

  if (needsScope(providerName, vertical) && scopes) {
    if (providerName === 'slack') {
      params += `&scope=&user_scope=${encodeURIComponent(scopes)}`;
    } else if (providerName === 'microsoftdynamicssales') {
      const url = new URL(BASE_URL);
      // Extract the base URL without parameters
      const base = url.origin + url.pathname;
      // Extract the resource parameter
      const resource = url.searchParams.get('resource');
      BASE_URL = base;
      let b = `https://${resource}/.default`;
      b += (' offline_access'); 
      params += `&scope=${encodeURIComponent(b)}`;
    } else if (providerName === 'deel') {
      params += `&scope=${encodeURIComponent(scopes.replace(/\t/g, ' '))}`;
    } else {
      params += `&scope=${encodeURIComponent(scopes)}`;
    }
  }

  // Special cases for certain providers
  switch (providerName) {
    case 'zoho':
    case 'squarespace':
      params += '&access_type=offline';
      break;
    case 'jira':
      params = `audience=api.atlassian.com&${params}&prompt=consent`;
      break;
    case 'jira_service_mgmt':
      params = `audience=api.atlassian.com&${params}&prompt=consent`;
      break;
    case 'gitlab':
      params += '&code_challenge=&code_challenge_method=';
      break;
    case 'gorgias':
      params = `&nonce=${randomString()}`;
      break;
    case 'googledrive':
      params = `${params}&access_type=offline`;
      break;
    case 'dropbox':
      params = `${params}&token_access_type=offline`
      break;
    case 'basecamp':
      params += `&type=web_server`
      break;
    case 'lever':
      params += `&audience=https://api.lever.co/v1/`
      break;
    case 'notion':
      params += `&owner=user`
      break;
    case 'klaviyo':
      const {codeChallenge, codeVerifier}= generateCodes()
      params += `&code_challenge_method=S256&code_challenge=${codeChallenge}` // todo: store codeVerifier in a store
      break;
    default:
      break;
  }

  const finalAuthUrl = `${BASE_URL}?${params}`;
  // console.log('Final Authentication : ', finalAuthUrl); 
  return finalAuthUrl;
}

const handleApiKeyUrl = async () => {
  return;
}

const handleBasicUrl = async () => {
  return;
}
