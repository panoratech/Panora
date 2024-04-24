import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { attribute as Attribute } from 'api';

const useFieldMappings = () => {
  return useQuery({queryKey: ['mappings'], queryFn: async (): Promise<Attribute[]> => {
    const response = await fetch(`${config.API_URL}/field-mapping/attribute`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});

};

export default useFieldMappings;
