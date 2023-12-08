import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
import { getProviderVertical } from 'shared-types';

const useProviderProperties = (linkedUserId: string, providerId: string, standardObject: string) => {
  return useQuery({
    queryKey: ['providerProperties', linkedUserId, providerId, standardObject], 
    queryFn: async () => {
      const response = await fetch(`${config.API_URL}/${getProviderVertical(providerId).toLowerCase()}/contact/properties?linkedUserId=${linkedUserId}&providerId=${providerId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProviderProperties;
