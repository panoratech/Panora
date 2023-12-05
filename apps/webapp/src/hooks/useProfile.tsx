/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';

const useProfile = () => {
  //TODO
  return useQuery({
    queryKey: ['profile'], 
    queryFn: async (): Promise<any[]> => {
      const response = await fetch(`${config.API_URL}/auth/users`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProfile;
