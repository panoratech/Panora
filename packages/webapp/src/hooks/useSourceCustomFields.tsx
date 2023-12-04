import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';


const useSourceCustomFields = (provider: string) => {
  return useQuery({
    queryKey: ['sourceCustomFields'], 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<Record<string, any>[]> => {
      const response = await fetch(`${config.API_URL}/field-mapping/origin-custom-fields?provider=${provider}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    },
    enabled: !!provider,
  });
};

export default useSourceCustomFields;
