import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { projects as Project } from 'api';


const useProjectsByUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['projects'], 
    enabled: userId!==undefined,
    queryFn: async (): Promise<Project[]> => {
      if(userId === "" || !userId){
        return [];
      }
      const response = await fetch(`${config.API_URL}/projects/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useProjectsByUser;
