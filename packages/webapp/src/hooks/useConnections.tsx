
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

export interface ConnectionsReturnType extends HookBaseReturn {
  connections: Job[];
  fetchConnections: () => Promise<void>;
}

type ConnectionsReturnFunction = () => ConnectionsReturnType;


const useConnections: ConnectionsReturnFunction = () => {
  const [connections, setConnections] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/connections`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { connections, fetchConnections, isLoading, error };
};

export default useConnections;
