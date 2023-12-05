/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import config from '@/utils/config';

export const useFieldMapping = (id: string) => {
  return useQuery({
    queryKey: ['mapping', id],
    queryFn: async (): Promise<any> => {
      const response = await fetch(`${config.API_URL}/field-mapping/attribute/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    },
    enabled: !!id, // This query will not run until an 'id' is provided
  });
};
