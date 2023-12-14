import config from '@/utils/config';
import { useQuery } from '@tanstack/react-query';
import { events as Event } from 'api';

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${config.API_URL}/events`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const useEvents = () => {
  return useQuery({
    queryKey: ['events'], 
    queryFn: fetchEvents
  });
};

export default useEvents;
