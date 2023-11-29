import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import ChooseProjectSwitcher from "./components/choose-project";
import { useEffect, useState } from "react";
import { API_KEYS } from "./data/api-keys";
import { columns } from "./data/columns";
import { DataTable } from "../jobs/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
export interface ApiKey {
  name: string; 
  token: string; 
  created: string; 
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>();

  useEffect(() => {
    async function loadTasks() {
      //const fetchedTasks = await getTasks();
      setApiKeys(API_KEYS);
    }
    loadTasks();
  }, []);
    return (

<div className="flex items-center justify-between space-y-2">
<div className="flex-1 space-y-4 p-8 pt-6">
<div className="flex flex-col items-start justify-between space-y-2">
  <h2 className="text-3xl font-bold tracking-tight">Api Keys</h2>
  <h2 className="text-lg font-bold tracking-tight">Manage your api keys.</h2>
</div>          
<div className="flex space-y-8 md:flex pb-4">
          <div></div>
          <ChooseProjectSwitcher className="w-52 mr-4" />
          <Dialog>
          <DialogTrigger asChild>
          <Button>
            <PlusCircledIcon className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Api Key</DialogTitle>
              <DialogDescription>
                Never share this key, you must saved it it will be displayed once !
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Name</Label>
                <Input id="url" placeholder="My Best Key For Finance Data" />
              </div>
            </div>
            <DialogFooter>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        {apiKeys && <DataTable data={apiKeys} columns={columns} />}</div>
</div>
    );
  }