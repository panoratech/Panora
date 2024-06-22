import { CONNECTORS_METADATA } from './connectors/metadata';
import { needsEndUserSubdomain, needsSubdomain, OAuth2AuthData, providerToType } from './envConfig';
import { AuthStrategy, DynamicAuthorization, ProviderConfig, StringAuthorization } from './types';
import { randomString } from './utils';

interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
  vertical: string;
  redirectUrlIngressWhenLocalDev?: string;
}

// make sure to check wether its api_key or oauth2 to build the right auth
// make sure to check if client has own credentials to connect or panora managed ones
export const constructAuthUrl = async ({ projectId, linkedUserId, providerName, returnUrl, apiUrl, vertical, redirectUrlIngressWhenLocalDev }: AuthParams) => {
  const encodedRedirectUrl = encodeURIComponent(`${redirectUrlIngressWhenLocalDev ? redirectUrlIngressWhenLocalDev : apiUrl}/connections/oauth/callback`);
  const state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  // console.log('State : ', JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  // console.log('encodedRedirect URL : ', encodedRedirectUrl);
  // const vertical = findConnectorCategory(providerName);
  if (vertical == null) {
    throw new ReferenceError('vertical is null');
  }

  const config = CONNECTORS_METADATA[vertical.toLowerCase()][providerName];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerName}`);
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
        apiUrl
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
    apiUrl
  } = input;

  const type = providerToType(providerName, vertical, authStrategy);
  
  // 1. env if selfhost and no custom
  // 2. backend if custom credentials
  // same for authBaseUrl with subdomain
  const DATA = await fetch(`${apiUrl}/connections-strategies/getCredentials?projectId=${projectId}&type=${type}`);
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
    if(typeof baseUrl === 'string') {
      BASE_URL = baseUrl;
    } else {
      BASE_URL = (baseUrl as DynamicAuthorization)(data.SUBDOMAIN as string);
    }
  } else if (needsEndUserSubdomain(providerName, vertical)) {
    if(typeof baseUrl === 'string') {
      BASE_URL = baseUrl;
    } else {
      BASE_URL = (baseUrl as DynamicAuthorization)('END_USER_SUBDOMAIN'); // TODO: get the END-USER domain from the hook (data coming from webapp client)
      // TODO: add the end user subdomain as query param on the redirect uri ?
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

  if(providerName === 'helpscout') {
    params = `client_id=${encodeURIComponent(clientId)}&state=${state}`;
  }

  if (scopes) {
    if(providerName === 'slack') {
      params += `&scope=&user_scope=${encodeURIComponent(scopes)}`;
    } else {
      params += `&scope=${encodeURIComponent(scopes)}`;
    }
  }

  // Special cases for certain providers
  switch (providerName) {
    case 'zoho':
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
      params += `&code_challenge_method=S256&code_challenge=` // TODO
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
