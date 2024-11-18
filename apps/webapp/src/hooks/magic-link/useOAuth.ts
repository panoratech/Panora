import config from '@/lib/config';
import { useState, useEffect, useRef } from 'react';
import { constructAuthUrl } from '@panora/shared/src/test';

type UseOAuthProps = {
  clientId?: string;
  providerName: string;           // Name of the OAuth provider
  vertical: string;    // Vertical (Crm, Ticketing, etc)
  returnUrl: string;              // Return URL after OAuth flow
  projectId: string;              // Project ID
  linkedUserId: string;           // Linked User ID
  redirectIngressUri: {
    status: boolean;
    value: string | null;
  },
  onSuccess: () => void;
  additionalParams?: {[key: string]: any}
};

const useOAuth = ({ providerName, vertical, returnUrl, projectId, linkedUserId, additionalParams, redirectIngressUri, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<number | ReturnType<typeof setInterval> | null>(null);
  const authWindowRef = useRef<Window | null>(null);  

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation

    return () => {
      // Cleanup on unmount
      clearExistingInterval(false);
      if (authWindowRef.current && !authWindowRef.current.closed) {
        authWindowRef.current.close();
      }
    };
  }, []);

  const clearExistingInterval = (clearAuthWindow: boolean) => {
    if (clearAuthWindow && authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close();
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };


  const openModal = async (onWindowClose: () => void) => {
    const apiUrl = config.API_URL!;
    const authUrl = await constructAuthUrl({
      projectId, linkedUserId, providerName, returnUrl, apiUrl , vertical, additionalParams, redirectUriIngress: redirectIngressUri 
    });

    if (!authUrl) {
      throw new Error("Auth Url is Invalid " + authUrl);
    }

    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const authWindow = window.open(authUrl as string, '_blank', `width=${width},height=${height},top=${top},left=${left}`); 
    authWindowRef.current = authWindow; 

    clearExistingInterval(false);

    const interval = setInterval(() => {
      try {
        const redirectedURL = authWindow!.location.href;
        const urlParams = new URL(redirectedURL).searchParams;
        const success = urlParams.get('success'); // Example parameter
        if (redirectedURL === returnUrl || success) {
          onSuccess(); 
          clearExistingInterval(true);
        }
      } catch (e) {
        console.error(e)
      }
      if (!authWindow || authWindow.closed) {
        if (onWindowClose) {
          onWindowClose();
        }
        authWindowRef.current = null;
        clearExistingInterval(false);
      }

    }, 500);

    intervalRef.current = interval;

    return authWindow;
  };

  return { open: openModal, isReady };
};

export default useOAuth;
