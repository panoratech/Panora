
import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';


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
  return useQuery({
    queryKey: ['projects'], 
    queryFn: async () => {
      const response = await fetch(`${config.API_URL}/projects`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useProjects;
