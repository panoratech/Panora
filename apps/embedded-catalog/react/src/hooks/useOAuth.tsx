import config from '@/helpers/config';
import { useState, useEffect } from 'react';
import { ConnectorCategory, constructAuthUrl } from '@panora/shared';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  vertical: ConnectorCategory;               // Vertical (Crm, Ticketing, etc)
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string;              // Project ID
  linkedUserId: string;           // Linked User ID
  optionalApiUrl?: string;        // URL of the User's Server
  onSuccess: () => void;
};

const useOAuth = ({ providerName, vertical, returnUrl, projectId, linkedUserId, optionalApiUrl, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation
  }, []);

  const openModal = async (onWindowClose: () => void) => {
    const apiUrl = optionalApiUrl? optionalApiUrl : config.API_URL!;
    const authUrl = await constructAuthUrl({
      projectId, linkedUserId, providerName, returnUrl, apiUrl, vertical
    });
    if(!authUrl) {
      throw new Error("Auth Url is Invalid "+ authUrl)
    }
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
