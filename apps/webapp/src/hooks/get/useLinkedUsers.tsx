import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { linked_users as LinkedUser } from 'api';
import Cookies from 'js-cookie';

const useLinkedUsers = () => {
  return useQuery({
    queryKey: ['linked-users'], 
    queryFn: async (): Promise<LinkedUser[]> => {
      const response = await fetch(`${config.API_URL}/linked_users/internal`,
      {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error occurred");
      }
      return response.json();
    }
  });
};
export default useLinkedUsers;
