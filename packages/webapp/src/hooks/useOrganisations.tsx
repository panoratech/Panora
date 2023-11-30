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

const useOrganisations = () => {
  const [organisations, setOrganisations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadOrganisations() {
      try {
        const response = await fetch(`${config.API_URL}/organisations`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrganisations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganisations();
  }, []);

  return { organisations, isLoading, error };
};

export default useOrganisations;
