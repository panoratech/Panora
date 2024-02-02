import config from '@/helpers/config';
import { useQuery } from '@tanstack/react-query';
import { linked_users as LinkedUser } from 'api';

const useLinkedUser = (originId: string) => {
  return useQuery({
    queryKey: ['linked-users', originId], 
    queryFn: async (): Promise<LinkedUser> => {
      const response = await fetch(`${config.API_URL}/linked-users/single?originId=${originId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useLinkedUser;
