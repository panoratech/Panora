import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { api_keys as ApiKey } from 'api';
import Cookies from 'js-cookie';

const useApiKeys = () => {
  return useQuery({
    queryKey: ['api-keys'], 
    queryFn: async (): Promise<ApiKey[]> => {
      const response = await fetch(`${config.API_URL}/auth/api_keys`,
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

export default useApiKeys;
