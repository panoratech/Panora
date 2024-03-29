import config from '@/helpers/config';
import { useQuery } from '@tanstack/react-query';

const useLinkedUser = (originId: string) => {
  return useQuery({
    queryKey: ['linked-users', originId], 
    queryFn: async (): Promise<any> => {
      const response = await fetch(`${config.API_URL}/linked-users/single?originId=${originId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useLinkedUser;
