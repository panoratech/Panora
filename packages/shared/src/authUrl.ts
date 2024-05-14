import { OAuth2AuthData, providerToType } from './envConfig';
import { AuthStrategy, providersConfig, ProviderConfig } from './utils';
interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
  vertical: string;
}

const randomString = () => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charSet.length);
    result += charSet[randomIndex];
  }
  return result;
}

// make sure to check wether its api_key or oauth2 to build the right auth
// make sure to check if client has own credentials to connect or panora managed ones
export const constructAuthUrl = async ({ projectId, linkedUserId, providerName, returnUrl, apiUrl, vertical }: AuthParams) => {
  const encodedRedirectUrl = encodeURIComponent(`${apiUrl}/connections/oauth/callback`);
  const state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  // console.log('State : ', JSON.stringify({ projectId, linkedUserId, providerName, vertical, returnUrl }));
  // console.log('encodedRedirect URL : ', encodedRedirectUrl);
  // const vertical = findProviderVertical(providerName);
  if (vertical == null) {
    throw new Error('vertical is null');
  }

  const config = providersConfig[vertical.toLowerCase()][providerName];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }
  const authStrategy = config.authStrategy!;

  // console.log(authStrategy)

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
  if (!clientId) throw new Error(`No client id for type ${type}`)
  const scopes = data.SCOPE

  const { urls: urls } = config;
  const { authBaseUrl: baseUrl } = urls;
 
  if (!baseUrl) throw new Error(`No authBaseUrl found for type ${type}`)

  // construct the baseAuthUrl based on the fact that client may use custom subdomain
  const BASE_URL: string = providerName === 'gorgias' ? `${apiUrl}${baseUrl}`:
  data.SUBDOMAIN ? data.SUBDOMAIN + baseUrl : baseUrl;

  // console.log('BASE URL IS '+ BASE_URL)
  if (!baseUrl || !BASE_URL) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  // Default URL structure
  let params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;

  // Adding scope for providers that require it, except for 'pipedrive'
  if (scopes) {
    params += `&scope=${encodeURIComponent(scopes)}`;
  }

  // Special cases for certain providers
  switch (providerName) {
    case 'zoho':
      params += '&response_type=code&access_type=offline';
      break;
    case 'jira':
    case 'jira_service_mgmt':
      params = `audience=api.atlassian.com&${params}&prompt=consent&response_type=code`;
      break;
    case 'gitlab':
      params += `&response_type=code&nonce=${randomString()}`;
      break;
    case 'gorgias':
      params = `&response_type=code&nonce=${randomString()}`;
      break; 
    default:
      // For most providers, response_type=code is common
      params += '&response_type=code';
  }

  const finalAuthUrl = `${BASE_URL}?${params}`;
  return finalAuthUrl;
}

const handleApiKeyUrl = async () => {
  return;
}

const handleBasicUrl = async () => {
  return;
}
