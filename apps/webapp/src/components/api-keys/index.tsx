import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
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
import useProjectStore from "@/state/projectStore";
import useApiKeyMutation from "@/hooks/mutations/useApiKeyMutation";
import useProfileStore from "@/state/profileStore";
import { useState } from "react";
import { LoadingSpinner } from "../connections/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { usePostHog } from 'posthog-js/react'
import config from "@/utils/config";

export default function ApiKeysPage() {
  const [keyName, setKeyName] = useState('');

  const { data: apiKeys, isLoading, error } = useApiKeys();
  const { mutate } = useApiKeyMutation();

  const {idProject} = useProjectStore();
  const {profile} = useProfileStore();

  const posthog = usePostHog()

  if(error){
    console.log("error apiKeys..");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    mutate({ 
      userId: profile!.id_user,
      projectId: idProject,
      keyName: keyName
    });
    posthog?.capture('api_key_created', {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
  };

  const tsApiKeys = apiKeys?.map((key) => ({
    name: key.name || "",
    token: key.api_key_hash,
    created: new Date().toISOString()
  }))

  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col items-start justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Api Keys</h2>
          <h2 className="text-lg font-bold tracking-tight">Manage your api keys.</h2>
        </div>          
        <div className="flex space-y-8 md:flex pb-4">
          {isLoading ? ( <LoadingSpinner className=""/>) : <>
          <div></div>
          <Dialog>
            <DialogTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-label="Select an api key"
              className={cn("w-[180px] justify-between")}
              onClick={() => {
                posthog?.capture("add_new_api_key_button_clicked", {
                  id_project: idProject,
                  mode: config.DISTRIBUTION
              })}}
            >
              <PlusCircledIcon className="mr-2 h-5 w-5" />
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
                  <Label htmlFor="keyName">Name</Label>
                  <Input 
                    id="keyName" placeholder="My Best Key For Finance Data" 
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSubmit}
                >Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
          }
        </div>
        {tsApiKeys && <DataTable data={tsApiKeys} columns={columns} />}
      </div>
    </div>
  );
}