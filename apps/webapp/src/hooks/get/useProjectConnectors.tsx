import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
interface ProjectConnector {
  id_connector_set: string;
  [key: string]: boolean | string;
}
 
const useProjectConnectors = (id: string) => {
  return useQuery({
    queryKey: ['project-connectors'], 
    queryFn: async (): Promise<ProjectConnector> => {
      const response = await fetch(`${config.API_URL}/project_connectors?projectId=${id}`,
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

export default useProjectConnectors;
