import { useQuery } from '@tanstack/react-query';
import { invite_links as MagicLink } from 'api';
import config from '@/helpers/config';

type Mlink = MagicLink & {id_project: string}

const useUniqueMagicLink = (id: string) => {
  return useQuery({
    queryKey: ['magic-link', id], 
    queryFn: async (): Promise<Mlink> => {
      const response = await fetch(`${config.API_URL}/magic-links/single?id=${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
    }
  });
};
export default useUniqueMagicLink;
