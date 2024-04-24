import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { webhook_endpoints as Webhook } from 'api';

const useWebhooks = () => {
  return useQuery({
    queryKey: ['webhooks'], 
    queryFn: async (): Promise<Webhook[]> => {
      console.log("Webhook mutation called")
      const response = await fetch(`${config.API_URL}/webhook`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useWebhooks;
