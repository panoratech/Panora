import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { useEffect, useState } from "react"
import { TASKS } from "./data/task";

export interface Task {
  method: string; 
  url: string; 
  status: string; 
  direction: string; 
  integration: string;
  organisation: string;
  date: string;
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>();

  useEffect(() => {
    async function loadTasks() {
      //const fetchedTasks = await getTasks();
      setTasks(TASKS);
    }

    loadTasks();
  }, []);
  return (
    <>
    
        {tasks && <DataTable data={tasks} columns={columns} />}
     
    </>
  )
}