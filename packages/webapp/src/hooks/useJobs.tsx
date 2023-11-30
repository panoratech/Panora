
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

export interface JobsReturnType extends HookBaseReturn {
  jobs: Job[];
  fetchJobs: () => Promise<void>;
}

type JobsReturnFunction = () => JobsReturnType;


const useJobs: JobsReturnFunction = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/jobs`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err as Error);
    }
    setIsLoading(false);
  };

  return { jobs, fetchJobs, isLoading, error };
};

export default useJobs;
