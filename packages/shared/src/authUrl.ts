import { getCredentials, OAuth2AuthData, providerToType } from "./envConfig";
import { AuthStrategy, findProviderVertical, providersConfig, ProviderConfig } from "./utils";

interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
}

// make sure to check wether its api_key or oauth2 to build the right auth
// make sure to check if client has own credentials to connect or panora managed ones
export const constructAuthUrl = async ({ projectId, linkedUserId, providerName, returnUrl, apiUrl }: AuthParams) => {
  const encodedRedirectUrl = encodeURIComponent(`${apiUrl}/connections/oauth/callback`);
  const state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, returnUrl }));

  console.log("State : ", JSON.stringify({ projectId, linkedUserId, providerName, returnUrl }));
  console.log("encodedRedirect URL : ", encodedRedirectUrl);

  const vertical = findProviderVertical(providerName);
  if (vertical == null) {
    return null;
  }

  const config = providersConfig[vertical.toLowerCase()][providerName];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerName}`);
  } 
  const authStrategy = config.authStrategy!;

  switch(authStrategy){
    case AuthStrategy.oauth2:
      handleOAuth2Url({
        providerName,
        authStrategy,
        projectId,
        config,
        encodedRedirectUrl,
        state
      });
      break;
    case AuthStrategy.api_key:
      handleApiKeyUrl();
      break;
    case AuthStrategy.basic:
      handleBasicUrl();
      break;
  }
};

type HandleOAuth2Url = {
  providerName: string;
  authStrategy: AuthStrategy;
  projectId: string;
  config: ProviderConfig;
  encodedRedirectUrl: string;
  state: string;
}

const handleOAuth2Url = async (input: HandleOAuth2Url) => {
  const {
    providerName,
    authStrategy,
    projectId,
    config,
    encodedRedirectUrl,
    state
  } = input;

  const type = providerToType(providerName, authStrategy);

  // 1. env if selfhost and no custom
  // 2. backend if custom credentials
  // same for authBaseUrl with subdomain
  const data = (await getCredentials(projectId, type)) as OAuth2AuthData;

  const clientId = data.CLIENT_ID;
  if(!clientId) throw new Error(`No client id for type ${type}`)

  const { scopes, authBaseUrl: baseUrl } = config;
  
  if (!baseUrl) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  // Default URL structure
  let params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;

  // Adding scope for providers that require it, except for 'pipedrive'
  if (providerName !== "pipedrive") {
    params += `&scope=${encodeURIComponent(scopes)}`;
  }

  // Special cases for certain providers
  switch (providerName) {
    case "zoho":
      params += "&response_type=code&access_type=offline";
      break;
    case "jira":
    case "jira_service_mgmt":
      params = `audience=api.atlassian.com&${params}&prompt=consent`;
      break;
    case "gitlab":
      params += "&code_challenge=&code_challenge_method=";
      break;
    default:
      // For most providers, response_type=code is common
      params += "&response_type=code";
  }

  const finalAuthUrl = `${baseUrl}?${params}`;
  console.log("Final Authentication : ", finalAuthUrl);
  return finalAuthUrl;
}

const handleApiKeyUrl = async () => {
  return;
}

const handleBasicUrl = async () => {
  return;
}
