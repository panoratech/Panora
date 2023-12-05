/* eslint-disable @typescript-eslint/no-explicit-any */

import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';

const fetchJobs = async (): Promise<any[]> => {
  const response = await fetch(`${config.API_URL}/jobs`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'], 
    queryFn: fetchJobs
  });
};

export default useJobs;
