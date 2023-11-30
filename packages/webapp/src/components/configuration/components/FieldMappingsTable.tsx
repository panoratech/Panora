import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { CONNECTIONS } from "@/components/connections/data/connection";
import { columns } from "@/components/connections/data/columns";
import { DataTable } from "@/components/jobs/components/data-table";

export interface Connection {
  organisation: string; 
  app: string; 
  status: string; 
  category: string; 
  linkedUser: string;
  date: string;
}

export default function FieldMappingsTable() {
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
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center space-x-4 justify-between flex-row">
        <Card className="w-1/2">
            <CardHeader>
                <CardTitle>Defined</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-4xl font-bold">0</p>
            </CardContent>

        </Card>
        <Card className="w-1/2">
            <CardHeader>
                <CardTitle>Mapped</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">3</p>
            </CardContent>
        </Card>                  
        </div>
        {connections && <DataTable data={connections} columns={columns} />}
      </div>
    </>
  )
}