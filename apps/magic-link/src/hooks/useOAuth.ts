import config from '@/helpers/config';
import { useState, useEffect } from 'react';
import { constructAuthUrl } from '@panora/shared/src/test';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  vertical: string;
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string;              // Project ID
  linkedUserId: string;           // Linked User ID
  onSuccess: () => void;
};

const useOAuth = ({ providerName, vertical, returnUrl, projectId, linkedUserId, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation
  }, []);


  const openModal = async (onWindowClose: () => void) => {
    const apiUrl = config.API_URL;
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
