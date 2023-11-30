
import { HookBaseReturn } from '@/types';
import config from '@/utils/config';
import { useState } from 'react';


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

export interface ApiKeysReturnType extends HookBaseReturn {
  apiKeys: Job[];
  fetchApiKeys: () => Promise<void>;
}

type ApiKeysReturnFunction = () => ApiKeysReturnType;


const useApiKeys: ApiKeysReturnFunction = () => {
  const [apiKeys, setApiKeys] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/auth/api-keys`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { apiKeys, fetchApiKeys, isLoading, error };
};

export default useApiKeys;
