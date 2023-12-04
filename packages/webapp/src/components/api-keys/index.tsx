import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { columns } from "./data/columns";
import { DataTable } from "../shared/data-table";
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
import useApiKeys from "@/hooks/useApiKeys";
import {api_keys as ApiKey} from "@api/exports";

export default function ApiKeysPage() {
  const { data: apiKeys, isLoading, error } = useApiKeys();
  
  if(isLoading){
    console.log("loading apiKeys..");
  }

  if(error){
    console.log("error apiKeys..");
  }

  const tsApiKeys = apiKeys?.map((key: ApiKey) => ({
    name: key.id_api_key, // or any other property that corresponds to 'name'
    token: key.api_key_hash, // or any other property that corresponds to 'token'
    created: new Date().toISOString() // or any other property that corresponds to 'created'
  }))

  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col items-start justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Api Keys</h2>
          <h2 className="text-lg font-bold tracking-tight">Manage your api keys.</h2>
        </div>          
        <div className="flex space-y-8 md:flex pb-4">
          <div></div>
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
        {tsApiKeys && <DataTable data={tsApiKeys} columns={columns} />}
      </div>
    </div>
  );
}