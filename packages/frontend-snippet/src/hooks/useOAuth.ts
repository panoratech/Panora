import { useState, useEffect } from 'react';
import { providersConfig } from '../helpers/utils';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string;              // Project ID
  linkedUserId: string;           // Linked User ID
  onSuccess: () => void;
};


const useOAuth = ({ providerName, returnUrl, projectId, linkedUserId, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation
  }, []);

  const constructAuthUrl = () => {
    const encodedRedirectUrl = encodeURIComponent(`${import.meta.env.VITE_BACKEND_DOMAIN}/connections/oauth/callback`);
    const state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, returnUrl }));

    const vertical = 'CRM'; //TODO when multiple verticals

    const config = providersConfig[vertical][providerName];
    if (!config) {
      throw new Error(`Unsupported provider: ${providerName}`);
    }

    const { clientId, scopes } = config;

    const baseUrl = config.authBaseUrl;
    if (!baseUrl) {
      throw new Error(`Unsupported provider: ${providerName}`);
    }
    const addScope = providerName == "pipedrive" ? false : true;
    let finalAuth = '';
    if ( providerName == 'zoho' ) {
      finalAuth = `${baseUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodedRedirectUrl}&state=${state}`
    } else if(providerName == "zendesk"){
      finalAuth = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodedRedirectUrl}&state=${state}`
    } else {
      finalAuth = addScope ? 
      `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&scope=${encodeURIComponent(scopes)}&state=${state}`
      : `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;
    }
    return finalAuth;
  };

  const openModal = () => {
    const authUrl = constructAuthUrl();
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(authUrl, 'OAuth', `width=${width},height=${height},top=${top},left=${left}`);

    onSuccess();
  };

  return { open: openModal, isReady };
};

export default useOAuth;
