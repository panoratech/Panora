import { DiscoveredOrganizations } from '@/lib/stytch/loadStytch';
import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';


const useDiscoveredOrganizations = () => {
  return useQuery({
    queryKey: ['discovered-organizations'], 
    queryFn: async (): Promise<DiscoveredOrganizations> => {
      const response = await fetch(`${config.API_URL}/stytch/discovery/organizations`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};

export default useDiscoveredOrganizations;
