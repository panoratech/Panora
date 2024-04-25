import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { projects as Project } from 'api';


const useProjectsByUser = (stytchUserId: string | undefined) => {
  return useQuery({
    queryKey: ['projects'], 
    enabled: stytchUserId!==undefined,
    queryFn: async (): Promise<Project[]> => {
      if(stytchUserId === "" || !stytchUserId){
        return [];
      }
      const response = await fetch(`${config.API_URL}/projects/${stytchUserId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useProjectsByUser;
