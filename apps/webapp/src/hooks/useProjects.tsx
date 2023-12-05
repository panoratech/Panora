/* eslint-disable @typescript-eslint/no-explicit-any */

import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';


const useProjects = () => {
  return useQuery({
    queryKey: ['projects'], 
    queryFn: async (): Promise<any[]> => {
      const response = await fetch(`${config.API_URL}/projects`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useProjects;
