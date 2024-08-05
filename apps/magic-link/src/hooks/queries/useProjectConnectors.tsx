import { useQuery } from '@tanstack/react-query';
import config from '@/helpers/config';

const useProjectConnectors = (id: string | null) => {
  return useQuery({
    queryKey: ['project-connectors', id],
    queryFn: async (): Promise<any> => {
      if (!id) {
        throw new Error('Project ID is not available');
      }
      const response = await fetch(`${config.API_URL}/project_connectors?projectId=${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!id, // Only run the query if id is truthy
    retry: false, // Don't retry if the project ID is not available
  });
};

export default useProjectConnectors;