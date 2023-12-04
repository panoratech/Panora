import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
import {organizations as Organization} from "@api/exports";

const useOrganisations = () => {
  return useQuery({
    queryKey: ['organisations'], 
    queryFn: async (): Promise<Organization[]> => {
      const response = await fetch(`${config.API_URL}/organisations`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useOrganisations;
