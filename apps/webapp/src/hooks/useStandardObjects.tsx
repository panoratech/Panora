/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import config from '@/utils/config';

export const useStandardObjects = () => {
  return useQuery({queryKey: ['standardObjects'], queryFn: async (): Promise<any[]> => {
    const response = await fetch(`${config.API_URL}/field-mapping/entities`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});
};
