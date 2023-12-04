import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import useJobs from "@/hooks/useJobs";
import {jobs as Job} from "@api/exports";

/*export interface Job {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}*/

export default function JobsTable() {
  const { data: jobs, isLoading, error } = useJobs();
  
  if(isLoading){
    console.log("loading jobs..");
  }

  if(error){
    console.log("error jobs..");
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedJobs = jobs?.map((job: Job) => ({
    method: '', // replace with actual value
    url: '', // replace with actual value
    status: job.status,
    direction: '', // replace with actual value
    integration: '', // replace with actual value
    organisation: '', // replace with actual value
    date: job.timestamp.toString(), // convert Date to string
  }));

  return (
    <>
      {transformedJobs && <DataTable data={transformedJobs} columns={columns} />}
    </>
  )
}