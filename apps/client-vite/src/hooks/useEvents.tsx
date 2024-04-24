import { PaginationParams } from '@/lib/types';
import config from '@/lib/config';
import { useQuery } from '@tanstack/react-query';
import { events as Event } from 'api';

const fetchEvents = async (params: PaginationParams): Promise<Event[]> => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  const response = await fetch(`${config.API_URL}/events?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const useEvents = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['events', { page: params.page, pageSize: params.pageSize }],
    queryFn: () => fetchEvents(params),
  });
};

export default useEvents;