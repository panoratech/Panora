import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { connections as Connection } from 'api';


const useConnections = () => {
  return useQuery({
    queryKey: ['connections'], 
    queryFn: async (): Promise<Connection[]> => {
      const response = await fetch(`${config.API_URL}/connections`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useConnections;
