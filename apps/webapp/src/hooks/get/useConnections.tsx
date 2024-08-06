import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { connections as Connection } from 'api';
import Cookies from 'js-cookie';


const useConnections = () => {
  return useQuery({
    queryKey: ['connections'], 
    queryFn: async (): Promise<Connection[]> => {
      const response = await fetch(`${config.API_URL}/connections/internal`,{
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

export default useConnections;
