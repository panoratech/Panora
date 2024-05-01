import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { attribute as Attribute } from 'api';
import Cookies from 'js-cookie';

const useFieldMappings = () => {
  return useQuery({queryKey: ['mappings'], queryFn: async (): Promise<Attribute[]> => {
    const response = await fetch(`${config.API_URL}/field-mapping/attribute`,
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
  }});

};

export default useFieldMappings;
