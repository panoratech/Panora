import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { connection_strategies as ConnectionStrategies } from 'api';

const useConnectionStrategies = (projectId : string) => {
  return useQuery({
    queryKey: ['connection-strategies'], 
    queryFn: async (): Promise<ConnectionStrategies[]> => {
      const response = await fetch(`${config.API_URL}/connections-strategies/GetConnectionStrategiesForProject?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useConnectionStrategies;
