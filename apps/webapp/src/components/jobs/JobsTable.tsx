import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import useJobs from "@/hooks/useJobs";
import { DataTableLoading } from "../shared/data-table-loading";
import { jobs as Job } from "api";

export default function JobsTable() {
  const { data: jobs, isLoading, error } = useJobs();
  
  //TODO
  const transformedJobs = jobs?.map((job: Job) => ({
    method: '', // replace with actual value
    url: '', // replace with actual value
    status: job.status,
    direction: '', // replace with actual value
    integration: '', // replace with actual value
    organisation: '', // replace with actual value
    date: job.timestamp.toString(), // convert Date to string
  }));
  
  if(isLoading){
    return (
      <DataTableLoading data={[]} columns={columns}/>
    )
  }

  if(error){
    console.log("error jobs..");
  }


  return (
    <>
      {transformedJobs && <DataTable data={transformedJobs} columns={columns}/>}
    </>
  )
}