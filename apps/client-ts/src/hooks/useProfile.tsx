import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { users as User } from 'api';

const useProfile = (stytchUserId: string) => {
  return useQuery({
    queryKey: ['profile', stytchUserId], 
    queryFn: async (): Promise<User[]> => {
      const response = await fetch(`${config.API_URL}/auth/users/${stytchUserId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProfile;
