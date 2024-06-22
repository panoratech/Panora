import { PaginationParams } from '@/lib/types';
import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { events as Event } from 'api';
import Cookies from 'js-cookie';

const fetchEvents = async (params: PaginationParams): Promise<Event[]> => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  const response = await fetch(`${config.API_URL}/events?${searchParams.toString()}`,
  {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${Cookies.get('access_token')}`,
      },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Unknown error occurred");
  }
  return response.json();
};

const useEvents = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['events', { page: params.page, limit: params.limit }],
    queryFn: () => fetchEvents(params),
  });
};

export default useEvents;