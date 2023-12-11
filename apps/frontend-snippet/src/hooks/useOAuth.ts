import { useState, useEffect } from 'react';
import { findProviderVertical, providersConfig } from '@/helpers/utils';
import config from '@/helpers/config';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string | undefined;              // Project ID
  linkedUserId: string | undefined;           // Linked User ID
  onSuccess: () => void;
};


const useOAuth = ({ providerName, returnUrl, projectId, linkedUserId, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation
  }, []);

  const constructAuthUrl = () => {
    const encodedRedirectUrl = encodeURIComponent(`${config.API_URL}/connections/oauth/callback`);
    const state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, returnUrl }));

    const vertical = findProviderVertical(providerName);
    if(vertical == null) {
      return null;
    }

    const config_ = providersConfig[vertical][providerName];
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
    if ( providerName == 'zoho' ) {
      finalAuth = `${baseUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodedRedirectUrl}&state=${state}`
      console.log(finalAuth);
      
    } else if(providerName == "zendesk"){
      finalAuth = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodedRedirectUrl}&state=${state}`
    } else {
      finalAuth = addScope ? 
      `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&scope=${encodeURIComponent(scopes)}&state=${state}`
      : `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;
    }
    return finalAuth;
  };

  const openModal = (onWindowClose: () => void) => {
    const authUrl = constructAuthUrl();
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const authWindow = window.open(authUrl as string, 'OAuth', `width=${width},height=${height},top=${top},left=${left}`);
    
    const interval = setInterval(() => {
      if (authWindow!.closed) {
        clearInterval(interval);
        if (onWindowClose) {
          onWindowClose();
        }
        onSuccess();
      }
    }, 500);

    return authWindow;
  };

  return { open: openModal, isReady };
};

export default useOAuth;
