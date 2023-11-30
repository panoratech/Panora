
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

export interface ProjectsReturnType extends HookBaseReturn {
  projects: Job[];
  fetchProjects: () => Promise<void>;
}

type ProjectsReturnFunction = () => ProjectsReturnType;


const useProjects: ProjectsReturnFunction = () => {
  const [projects, setProjects] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/projects`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { projects, fetchProjects, isLoading, error };
};

export default useProjects;
