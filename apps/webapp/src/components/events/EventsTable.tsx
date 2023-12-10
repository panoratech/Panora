import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import useEvents from "@/hooks/useEvents";
import { DataTableLoading } from "../shared/data-table-loading";
import { events as Event } from "api";

export default function EventsTable() {
  const { data: events, isLoading, error } = useEvents();
  
  //TODO
  const transformedEvents = events?.map((event: Event) => ({
    method: '', // replace with actual value
    url: '', // replace with actual value
    status: event.status,
    direction: '', // replace with actual value
    integration: '', // replace with actual value
    organisation: '', // replace with actual value
    date: event.timestamp.toString(), // convert Date to string
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
      {transformedEvents && <DataTable data={transformedEvents} columns={columns}/>}
    </>
  )
}