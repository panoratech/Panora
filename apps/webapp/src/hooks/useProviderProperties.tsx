import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
 
const useProviderProperties = (linkedUserId: string, providerId: string) => {
  return useQuery({
    queryKey: ['providerProperties', linkedUserId, providerId], 
    queryFn: async () => {
      const response = await fetch(`${config.API_URL}/field-mapping/properties?linkedUserId=${linkedUserId}&providerId=${providerId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProviderProperties;
