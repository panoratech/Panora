import { useQuery } from '@tanstack/react-query';
import config from '@/helpers/config';

const useProjectConnectors = (id: string,API_URL : string) => {
  return useQuery({
    queryKey: ['project-connectors', id], 
    queryFn: async (): Promise<any> => {
      const response = await fetch(`${API_URL}/project_connectors?projectId=${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProjectConnectors;
