import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { webhook_endpoints as Webhook } from 'api';
import Cookies from 'js-cookie';

const useWebhooks = () => {
  return useQuery({
    queryKey: ['webhooks'], 
    queryFn: async (): Promise<Webhook[]> => {
      console.log("Webhook mutation called")
      const response = await fetch(`${config.API_URL}/webhooks/internal`,
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
export default useWebhooks;
