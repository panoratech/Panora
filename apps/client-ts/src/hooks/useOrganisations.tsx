import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { organizations as Organisation } from 'api';

const fetchOrgs = async (): Promise<Organisation[]> => {
  const response = await fetch(`${config.API_URL}/organisations`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useOrganisations = () => {
  return useQuery({
    queryKey: ['organisations'], 
    queryFn: fetchOrgs
  });
};
export default useOrganisations;
