/* eslint-disable react/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import config from '@/helpers/config';

const useProjectConnectors = (id: string) => {
  return useQuery({
    queryKey: ['project-connectors', id], 
    queryFn: async (): Promise<any> => {
      const response = await fetch(`${config.API_URL}/project-connectors?projectId=${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useProjectConnectors;
