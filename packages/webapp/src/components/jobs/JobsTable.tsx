import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import useJobs from "@/hooks/useJobs";

export interface Job {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}

export default function JobsTable() {
  const { data: jobs, isLoading, error } = useJobs();
  if(isLoading){
    console.log("loading jobs..");
  }
  if(error){
    console.log("error jobs..");
  }
  
  return (
    <>
      {jobs && <DataTable data={jobs} columns={columns} />}
    </>
  )
}