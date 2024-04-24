import { useQuery } from '@tanstack/react-query';
import config from '@/lib/config';
import { entity as Entity } from 'api';

export const useStandardObjects = () => {
  return useQuery({queryKey: ['standardObjects'], queryFn: async (): Promise<Entity[]> => {
    const response = await fetch(`${config.API_URL}/field-mapping/entities`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});
};
