import { columns } from "./data/columns"
import { DataTable } from "./../jobs/components/data-table"
import { useEffect, useState } from "react"
import { CONNECTIONS } from "./data/connection";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

export interface Connection {
  organisation: string; 
  app: string; 
  status: string; 
  category: string; 
  linkedUser: string;
  date: string;
}

export default function ConnectionTable() {
  const [connections, setTasks] = useState<Connection[]>();

  useEffect(() => {
    async function loadTasks() {
      //const fetchedTasks = await getTasks();
      setTasks(CONNECTIONS);
    }

    loadTasks();
  }, []);
  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center space-x-4 justify-between flex-row">
        <Card className="w-1/3">
            <CardHeader>
                <CardTitle>Linked</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-4xl font-bold">0</p>
            </CardContent>

        </Card>
        <Card className="w-1/3">
            <CardHeader>
                <CardTitle>Incomplete Link</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">3</p>
            </CardContent>
        </Card>
        <Card className="w-1/3">
            <CardHeader>
                <CardTitle>Relink Needed</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-4xl font-bold">1</p>
            </CardContent>

        </Card>
        </div>

        {connections && <DataTable data={connections} columns={columns} />}
      </div>
    </>
  )
}