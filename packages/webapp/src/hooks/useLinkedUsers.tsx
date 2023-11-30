
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

export interface LUReturnType extends HookBaseReturn {
  linkedUsers: Job[];
  fetchLinkedUsers: () => Promise<void>;
}

type LUReturnFunction = () => LUReturnType;


const useLinkedUsers: LUReturnFunction = () => {
  const [linkedUsers, setLinkedUsers] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLinkedUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/linked-users`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLinkedUsers(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { linkedUsers, fetchLinkedUsers, isLoading, error };
};

export default useLinkedUsers;
