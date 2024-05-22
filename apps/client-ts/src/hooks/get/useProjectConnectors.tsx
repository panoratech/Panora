import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface ProjectConnectorBase {
  id_project: string;
  id_project_connector: string;
}

interface ProjectConnector extends ProjectConnectorBase {
  [key: string]: boolean | string;
}

const useProjectConnectors = (id: string) => {
  return useQuery({
    queryKey: ['project-connectors'], 
    queryFn: async (): Promise<ProjectConnector> => {
      const response = await fetch(`${config.API_URL}/project-connectors?projectId=${id}`,
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

export default useProjectConnectors;
