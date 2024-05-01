import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const useProviderProperties = (linkedUserId: string, providerId: string) => {
  return useQuery({
    queryKey: ['providerProperties', linkedUserId, providerId], 
    queryFn: async () => {
      const response = await fetch(`${config.API_URL}/field-mapping/properties?linkedUserId=${linkedUserId}&providerId=${providerId}`,
      {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${Cookies.get('access_token')}`,
        },
      });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProviderProperties;
