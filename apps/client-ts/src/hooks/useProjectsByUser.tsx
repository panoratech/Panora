import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { projects as Project } from 'api';


const useProjectsByUser = (stytchUserId: string) => {
  return useQuery({
    queryKey: ['projects'], 
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch(`${config.API_URL}/projects/${stytchUserId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useProjectsByUser;
