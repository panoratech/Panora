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

const useProjects = () => {
  const [projects, setProjects] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(`${config.API_URL}/projects`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  return { projects, isLoading, error };
};

export default useProjects;
