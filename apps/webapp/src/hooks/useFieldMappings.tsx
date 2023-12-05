/* eslint-disable @typescript-eslint/no-explicit-any */

import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';

const useFieldMappings = () => {
  return useQuery({queryKey: ['mappings'], queryFn: async (): Promise<any[]> => {
    const response = await fetch(`${config.API_URL}/field-mapping/attribute`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});

};

export default useFieldMappings;
