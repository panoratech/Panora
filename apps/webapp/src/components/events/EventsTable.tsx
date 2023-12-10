import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import useEvents from "@/hooks/useEvents";
import { DataTableLoading } from "../shared/data-table-loading";
import { events as Event } from "api";

export default function EventsTable() {
  const { data: events, isLoading, error } = useEvents();
  
  //TODO
  const transformedEvents = events?.map((event: Event) => ({
    method: event.method, // replace with actual value
    url: event.url, // replace with actual value
    status: event.status,
    direction: event.type, // replace with actual value
    integration: event.provider, // replace with actual value + logo
    date: event.timestamp.toLocaleString(), // convert Date to string
  }));

  const sortedTransformedEvents = transformedEvents?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  
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
      {sortedTransformedEvents && <DataTable data={sortedTransformedEvents} columns={columns}/>}
    </>
  )
}