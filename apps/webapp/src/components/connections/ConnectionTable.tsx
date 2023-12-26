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
import { DataTableLoading } from "../shared/data-table-loading";
import { useState } from "react";
import AddConnectionButton from "./components/AddConnectionButton";
import config from "@/utils/config";
import useMagicLinkStore from "@/state/magicLinkStore";
import { LoadingSpinner } from "./components/LoadingSpinner";
import useOrganisationStore from "@/state/organisationStore";

export default function ConnectionTable() {
  const { data: connections, isLoading, error } = useConnections();
  const [isGenerated, setIsGenerated] = useState(false);
  
  const {uniqueLink} = useMagicLinkStore();
  const {nameOrg} = useOrganisationStore();

  if (isLoading) {
    return <LoadingSpinner className=""/>
  }

  if (error) {
    console.log("error connections..");
  }
 
  const linkedConnections = (filter: string) => connections?.filter((connection) => connection.status == filter);

  const ts = connections?.map((connection) => ({
    organisation: nameOrg, 
    app: connection.provider_slug,
    category: connection.token_type, 
    status: connection.status,
    linkedUser: connection.alias, 
    date: new Date().toISOString(), 
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
              <p className="text-4xl font-bold">{linkedConnections("0")?.length}</p>
            </CardContent>

          </Card>
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Incomplete Link</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{linkedConnections("1")?.length}</p>
            </CardContent>
          </Card>
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Relink Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{linkedConnections("2")?.length}</p>
            </CardContent>

          </Card>


        </div>
        {isGenerated ? <Dialog open={true}>
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
                <CopyLinkInput />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => window.open(`${config.FRONT_DOMAIN}/?uniqueLink=${uniqueLink}`, '_blank')}>
                <p className="mr-2">Open Link</p>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> :
          <AddConnectionButton setIsGenerated={setIsGenerated} />
        }
        {isLoading && <DataTableLoading data={[]} columns={columns} />}
        {ts && <DataTable data={ts} columns={columns} />}
      </div>
    </>
  )
}