import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const useProviderProperties = (linkedUserId: string, providerId: string, vertical: string) => {
  return useQuery({
    queryKey: ['providerProperties', linkedUserId, providerId, vertical], 
    queryFn: async () => {
      const response = await fetch(`${config.API_URL}/field_mappings/properties?linkedUserId=${linkedUserId}&providerId=${providerId}&vertical=${vertical}`,
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
export default useProviderProperties;
