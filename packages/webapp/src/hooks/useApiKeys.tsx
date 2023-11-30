import config from '@/utils/config';
import { useState, useEffect } from 'react';


//TODO: import from shared type 
export interface Job {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}

const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadApiKeys() {
      try {
        const response = await fetch(`${config.API_URL}/apiKeys`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setApiKeys(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadApiKeys();
  }, []);

  return { apiKeys, isLoading, error };
};

export default useApiKeys;
