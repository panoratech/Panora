import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { useEffect, useState } from "react"
import { TASKS } from "./data/task";


export default function TaskPage() {
  const [tasks, setTasks] = useState<
  { id: string; title: string; status: string; label: string; direction: string; }[]
  >();

  useEffect(() => {
    async function loadTasks() {
      //const fetchedTasks = await getTasks();
      setTasks(TASKS);
    }

    loadTasks();
  }, []);
  return (
    <>
      <div className="md:hidden">
        <img
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <img
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
        </div>
        {tasks && <DataTable data={tasks} columns={columns} />}
      </div>
    </>
  )
}