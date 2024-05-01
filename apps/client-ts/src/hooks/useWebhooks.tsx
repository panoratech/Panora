import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { webhook_endpoints as Webhook } from 'api';
import Cookies from 'js-cookie';

const useWebhooks = (project_id: string) => {
  return useQuery({
    queryKey: ['webhooks'], 
    queryFn: async (): Promise<Webhook[]> => {
      console.log("Webhook mutation called")
      const response = await fetch(`${config.API_URL}/webhook?project_id=${project_id}`,
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
export default useWebhooks;
