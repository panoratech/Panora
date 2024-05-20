import { columns } from "./columns"
import { ApiDataTable } from '../shared/api-data-table';
import useEvents from "@/hooks/get/useEvents";
import { DataTableLoading } from "../shared/data-table-loading";
import { events as Event } from "api";
import { useEventsCount } from '@/hooks/get/useEventsCount';
import { useQueryPagination } from '@/hooks/get/useQueryPagination';
import useProjectStore from "@/state/projectStore";

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