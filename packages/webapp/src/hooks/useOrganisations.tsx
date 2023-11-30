
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

export interface OrganisationsReturnType extends HookBaseReturn {
  organisations: Job[];
  fetchOrganisations: () => Promise<void>;
}

type OrgansiationsReturnFunction = () => OrganisationsReturnType;


const useOrganisations: OrgansiationsReturnFunction = () => {
  const [organisations, setOrganisations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganisations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/organisations`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setOrganisations(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { organisations, fetchOrganisations, isLoading, error };
};

export default useOrganisations;
