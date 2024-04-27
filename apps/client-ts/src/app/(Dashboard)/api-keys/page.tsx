'use client'

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
import { columns } from "@/components/ApiKeys/data/columns";
import { DataTable } from "@/components/shared/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import useApiKeys from "@/hooks/useApiKeys";
import useProjectStore from "@/state/projectStore";
import useApiKeyMutation from "@/hooks/mutations/useApiKeyMutation";
import useProfileStore from "@/state/profileStore";
import { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTableLoading } from "@/components/shared/data-table-loading";


const formSchema = z.object({
  apiKeyIdentifier: z.string().min(2, {
    message: "apiKeyIdentifier must be at least 2 characters.",
  })
})

interface TSApiKeys {
  name : string,
  token : string,
  created : string
}

export default function Page() {
  const [open,setOpen] = useState(false)
  const [tsApiKeys,setTSApiKeys] = useState<TSApiKeys[] | undefined>([])

  const { data: apiKeys, isLoading, error } = useApiKeys();
  const { mutate } = useApiKeyMutation();

  useEffect(() => {

    const temp_tsApiKeys = apiKeys?.map((key) => ({
      name: key.name || "",
      token: key.api_key_hash,
      created: new Date().toISOString()
    }))

    setTSApiKeys(temp_tsApiKeys)
    
  },[apiKeys])

  const {idProject} = useProjectStore();
  const {profile} = useProfileStore();

  const posthog = usePostHog()

  if(error){
    console.log("error apiKeys..");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKeyIdentifier: "",
    },
    
  })

  const onCancel = () => {
    setOpen(!open)
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    form.reset()
  }


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // e.preventDefault(); // Prevent default form submission
    console.log("user data is => "+ JSON.stringify(profile))
    console.log("id_user is "+ profile!.id_user)
    console.log("idProject is "+ idProject)
    mutate({ 
      userId: profile!.id_user,
      projectId: idProject,
      keyName: values.apiKeyIdentifier
    });
    posthog?.capture('api_key_created', {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })

    setOpen(!open)


  };

  return (
    <div className="flex flex-col items-center justify-between space-y-2 w-full">
      <div className="flex-1 space-y-4 pt-6">
        <div className="flex flex-col items-start justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Api Keys</h2>
          <h2 className="text-lg font-bold tracking-tight">Manage your api keys.</h2>
        </div>          
        <div className="flex space-y-8 md:flex pb-4">
          <Dialog open={open} onOpenChange={handleOpenChange}>
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

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                  <FormField
                        control={form.control}
                        name="apiKeyIdentifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key Identifier</FormLabel>
                            <FormControl>
                              <Input 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                              placeholder="My Best Key For Finance Data" {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This is the API Key Identifier of system.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                  </div>
                </div>
              <DialogFooter>
                <Button variant='outline' type="reset" onClick={() => onCancel()}>Cancel</Button>
                <Button type='submit'>Create</Button>
              </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Suspense>
          {isLoading && <DataTableLoading data={[]} columns={columns}/>}
          {tsApiKeys && <DataTable data={tsApiKeys} columns={columns} />}
        </Suspense>
      </div>
    </div>
  );
}