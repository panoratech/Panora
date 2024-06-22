import { columns } from "./columns"
import { ApiDataTable } from '../shared/api-data-table';
import useEvents from "@/hooks/get/useEvents";
import { DataTableLoading } from "../shared/data-table-loading";
import { events as Event } from "api";
import { useEventsCount } from '@/hooks/get/useEventsCount';
import { useQueryPagination } from '@/hooks/get/useQueryPagination';

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
    limit: pagination.limit,
  });
  
  const transformedEvents = events?.map((event: Event) => ({
    method: event.method, 
    url: event.url, 
    status: event.status,
    direction: event.type, 
    integration: event.provider, 
    id_linked_user: event.id_linked_user,
    date: event.timestamp.toLocaleString(), 
  }));

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