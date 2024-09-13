import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { api_keys as ApiKey } from 'api';
import Cookies from 'js-cookie';

const useRagSettings = () => {
  return useQuery({
    queryKey: ['rag-settings'], 
    queryFn: async (): Promise<ApiKey[]> => {
      return []
    }
  });
};

export default useRagSettings;
