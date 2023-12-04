import { columns } from "./components/columns"
import { DataTable } from "../shared/data-table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import CopyLinkInput from "./components/CopyLinkInput";
import useConnections from "@/hooks/useConnections";
import { Skeleton } from "@/components/ui/skeleton"

export interface Connection {
  organisation: string; 
  app: string; 
  status: string; 
  category: string; 
  linkedUser: string;
  date: string;
}

export default function ConnectionTable() {
  const { data: connections, isLoading, error } = useConnections();
  
  if(isLoading){
    return (
      <Skeleton className="w-[400px] h-[30px] rounded-md" />
    )
  }

  if(error){
    console.log("error connections..");
  }

  const ts = connections?.map(connection => ({
    organisation: connection.id_project, // replace with actual mapping
    app: connection.provider_slug, // replace with actual mapping
    category: connection.token_type, // replace with actual mapping
    status: connection.status,
    linkedUser: connection.id_linked_user, // replace with actual mapping
    date: new Date().toISOString(), // replace with actual mapping
  }))
  
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
            <Button variant="outline" className="">
                <PlusCircledIcon className="mr-2 h-4 w-4" />
                Add New Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:w-[450px]">
            <DialogHeader>
              <DialogTitle>Share this magic link with your customers</DialogTitle>
              <DialogDescription>
                Once they finish the oAuth flow, a new connection would be enabled.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
              <CopyLinkInput/>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Share</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {ts && <DataTable data={ts} columns={columns} />}
      </div>
    </>
  )
}