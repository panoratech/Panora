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

  console.log("State : ", JSON.stringify({ projectId, linkedUserId, providerName, returnUrl }))
  console.log("encodedRedirect URL : ", encodedRedirectUrl)

  const vertical = findProviderVertical(providerName);
  if (vertical == null) {
    return null;
  }

  const config_ = providersConfig[vertical.toLowerCase()][providerName];
  if (!config_) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  const { clientId, scopes } = config_;

  const baseUrl = config_.authBaseUrl;


  if (!baseUrl) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }
  const addScope = providerName == "pipedrive" ? false : true;
  let finalAuth = '';
  if (providerName == 'zoho') {
    finalAuth = `${baseUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodedRedirectUrl}&access_type=offline&state=${state}`
    console.log(finalAuth);
  } else if (providerName == "zendesk") {
    finalAuth = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodedRedirectUrl}&state=${state}`
  } else if (providerName == "attio") {
    finalAuth = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodedRedirectUrl}&state=${state}`
  } else if (providerName == "zendesk_tcg" || providerName == "front") {
    finalAuth = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodedRedirectUrl}&scope=${encodeURIComponent(scopes)}&state=${state}`
  } else {
    finalAuth = addScope ?
      `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&scope=${encodeURIComponent(scopes)}&state=${state}`
      : `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;
  }

  console.log("Final Authentication : ", finalAuth)
  return finalAuth;
};