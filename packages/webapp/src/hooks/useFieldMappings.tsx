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

const useFieldMappings = () => {
  const [fieldMappings, setFieldMappings] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFieldMappings() {
      try {
        const response = await fetch(`${config.API_URL}/fieldMappings`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFieldMappings(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFieldMappings();
  }, []);

  return { fieldMappings, isLoading, error };
};

export default useFieldMappings;
