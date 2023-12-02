import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';


//TODO: import from shared type 
export interface Job {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}
 

const useFieldMappings = () => {
  const {
    data: mappings,
    isLoading: isLoadingMappings,
    error: errorMappings,
  } = useQuery({queryKey: ['mappings'], queryFn: async () => {
    const response = await fetch(`${config.API_URL}/field-mapping/attribute`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});

  const {
    data: standardObjects,
    isLoading: isLoadingStandardObjects,
    error: errorStandardObjects,
  } = useQuery({queryKey: ['standardObjects'], queryFn: async()=> {
    const response = await fetch(`${config.API_URL}/field-mapping/entities`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
  }});


  return { 
    mappings, 
    standardObjects, 
    isLoading: isLoadingMappings || isLoadingStandardObjects,
    error: errorMappings || errorStandardObjects, 
  };

};

export default useFieldMappings;
