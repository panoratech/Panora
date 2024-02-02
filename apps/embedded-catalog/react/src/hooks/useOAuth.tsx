import config from '@/helpers/config';
import { useState, useEffect } from 'react';
import { constructAuthUrl } from '@panora/shared';

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

  const openModal = (onWindowClose: () => void) => {
    const apiUrl = config.API_URL;
    const authUrl = constructAuthUrl({
      projectId, linkedUserId, providerName, returnUrl, apiUrl
    });
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
