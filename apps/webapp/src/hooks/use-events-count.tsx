import { keepPreviousData, useQuery } from '@tanstack/react-query';
import config from '@/utils/config';

const fetchEventsCount = async (): Promise<number> => {
  const response = await fetch(`${config.API_URL}/events/count`);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const useEventsCount = () => {
  return useQuery({
    queryKey: ['events count'],
    queryFn: fetchEventsCount,
    placeholderData: keepPreviousData,
  });
};