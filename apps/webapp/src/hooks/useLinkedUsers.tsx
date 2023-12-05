import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
import { linked_users as LinkedUser } from 'api';

const useLinkedUsers = () => {
  return useQuery({
    queryKey: ['linked-users'], 
    queryFn: async (): Promise<LinkedUser[]> => {
      const response = await fetch(`${config.API_URL}/linked-users`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useLinkedUsers;
