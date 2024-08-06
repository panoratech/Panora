import { useQuery } from '@tanstack/react-query';
import { invite_links as MagicLink } from 'api';
import config from '@/helpers/config';

type Mlink = MagicLink & {id_project: string}

const useUniqueMagicLink = (id: string | null) => {
  return useQuery<Mlink, Error>({
    queryKey: ['magic-link', id],
    queryFn: async (): Promise<Mlink> => {
      if (!id) {
        throw new Error('Magic Link ID is not available');
      }
      const response = await fetch(`${config.API_URL}/magic_links/${id.trim()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!id && id.trim().length > 0, // Only run the query if id is truthy and not just whitespace
    retry: false, // Don't retry if the magic link ID is not available
  });
};

export default useUniqueMagicLink;