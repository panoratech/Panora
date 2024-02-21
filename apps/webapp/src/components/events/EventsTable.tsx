import { columns } from "./components/columns"
import { ApiDataTable } from '../api-data-table';
import useEvents from "@/hooks/useEvents";
import { DataTableLoading } from "../shared/data-table-loading";
import { events as Event } from "api";
import { useEventsCount } from '@/hooks/use-events-count';
import { useQueryPagination } from '@/hooks/use-query-pagination';

export default function EventsTable() {
  const { data: eventsCount } = useEventsCount();
  
  const pagination = useQueryPagination({ totalItems: eventsCount });

  const {
    data: events,
    isLoading,
    isFetching,
    error,
  } = useEvents({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  
  //TODO
  const transformedEvents = events?.map((event: Event) => ({
    method: event.method, // replace with actual value
    url: event.url, // replace with actual value
    status: event.status,
    direction: event.type, // replace with actual value
    integration: event.provider, // replace with actual value + logo
    date: event.timestamp.toLocaleString(), // convert Date to string
  }));

  // Already did it at api level
  // const sortedTransformedEvents = transformedEvents?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if(isLoading){
    return (
      <DataTableLoading data={[]} columns={columns}/>
    )
  }

  if(error){
    console.log("error events..");
  }


  return (
    <>
      {transformedEvents && (
        <ApiDataTable data={transformedEvents} columns={columns} {...pagination} isLoading={isFetching} />
      )}
    </>
  );
}