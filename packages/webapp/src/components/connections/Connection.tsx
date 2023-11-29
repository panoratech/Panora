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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
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
        <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-[18%] outline">
                        <PlusCircledIcon className="mr-2 h-4 w-4" />
                        Add New Connection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:w-[450px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          defaultValue="Pedro Duarte"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input
                          id="username"
                          defaultValue="@peduarte"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                </DialogFooter>
                  </DialogContent>
        </Dialog>

        {connections && <DataTable data={connections} columns={columns} />}
      </div>
    </>
  )
}