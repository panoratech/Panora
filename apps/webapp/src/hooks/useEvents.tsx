import { PaginationParams } from '@/types';
import config from '@/utils/config';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
    placeholderData: keepPreviousData,
  });
};

export default useEvents;