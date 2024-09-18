import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { projects_pull_frequency as PullFrequency } from 'api';
import Cookies from 'js-cookie';


const usePullFrequencies = () => {
  return useQuery({
    queryKey: ['pull_frequencies'], 
    queryFn: async (): Promise<PullFrequency> => {
      const response = await fetch(`${config.API_URL}/sync/internal/pull_frequencies`,{
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

export default usePullFrequencies;
