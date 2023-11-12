import { useState, useEffect } from 'react';

type UseOAuthProps = {
  linkToken: string;
  clientId: string;       // Your OAuth client ID
  scopes: string;         // The scopes you are requesting
  redirectUri: string;    // The redirect URI registered with the OAuth provider
  onSuccess: () => void;
};

const useOAuth = ({ linkToken, clientId, scopes, redirectUri, onSuccess }: UseOAuthProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform any setup logic here
    setTimeout(() => setIsReady(true), 1000); // Simulating async operation
  }, []);

  const openModal = () => {
    //const authUrl = `https://app-eu1.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    const authUrl = `https://app-eu1.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000/oauth/callback&scope=crm.lists.read%20crm.lists.write`
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(authUrl, 'OAuth', `width=${width},height=${height},top=${top},left=${left}`);

    // Call the onSuccess function here if needed, or after the OAuth flow is completed
  };

  return { open: openModal, isReady };
};

export default useOAuth;
