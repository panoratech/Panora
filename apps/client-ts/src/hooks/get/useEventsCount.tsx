import { useQuery } from '@tanstack/react-query';
import config from '@/lib/config';
import Cookies from 'js-cookie';

const fetchEventsCount = async (): Promise<number> => {
  const response = await fetch(`${config.API_URL}/events/count`, {
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
};

export const useEventsCount = () => {
  return useQuery({
    queryKey: ['events count'],
    queryFn: fetchEventsCount,
  });
};