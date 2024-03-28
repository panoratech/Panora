import { findProviderVertical, providersConfig } from "./utils";

interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
}

export const constructAuthUrl = ({ projectId, linkedUserId, providerName, returnUrl, apiUrl }: AuthParams) => {
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

  const { clientId, scopes, authBaseUrl: baseUrl } = config;
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
};
