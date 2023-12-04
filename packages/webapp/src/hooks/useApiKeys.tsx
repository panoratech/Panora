import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
import {api_keys as ApiKey} from "@api/exports";


const useApiKeys = () => {
  return useQuery({
    queryKey: ['api-keys'], 
    queryFn: async (): Promise<ApiKey[]> => {
      const response = await fetch(`${config.API_URL}/auth/api-keys`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useApiKeys;
