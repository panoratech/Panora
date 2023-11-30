import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import { useEffect, useState } from "react"
import {JOBS} from "./data/jobsConst";

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
  const [jobs, setJobs] = useState<Job[]>();

  useEffect(() => {
    async function loadJobs() {
      setJobs(JOBS);
    }

    loadJobs();
  }, []);
  return (
    <>
      {jobs && <DataTable data={jobs} columns={columns} />}
    </>
  )
}