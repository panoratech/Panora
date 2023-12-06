import { useQuery } from '@tanstack/react-query';
import { linked_users as LinkedUser } from 'api';
import config from '@/helpers/config';

const useLinkedUser = (id: string) => {
  return useQuery({
    queryKey: ['linked-users', id], 
    queryFn: async (): Promise<LinkedUser> => {
      const response = await fetch(`${config.API_URL}/linked-users?id=${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useLinkedUser;
