'use client'

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import useApiKeys from "@/hooks/get/useApiKeys";
import useProjectStore from "@/state/projectStore";
import useCreateApiKey from "@/hooks/create/useCreateApiKey";
import useProfileStore from "@/state/profileStore";
import { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTableLoading } from "@/components/shared/data-table-loading";
import {CustomHeading}  from "@/components/shared/custom-heading";
import { useColumns } from "@/components/ApiKeys/columns";
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  apiKeyIdentifier: z.string().min(2, {
    message: "apiKeyIdentifier must be at least 2 characters.",
  })
})

interface TSApiKeys {
  id_api_key: string;
  name : string;
  token : string;
}

export default function Page() {
  const [open,setOpen] = useState(false)
  const [tsApiKeys,setTSApiKeys] = useState<TSApiKeys[] | undefined>([])

  const {idProject} = useProjectStore();
  const {profile} = useProfileStore();

  const { data: apiKeys, isLoading, error } = useApiKeys();
  const { mutate } = useCreateApiKey();
  const columns = useColumns();

  useEffect(() => {
    const temp_tsApiKeys = apiKeys?.map((key) => ({
      id_api_key: key.id_api_key,
      name: key.name || "",
      token: key.api_key_hash,
    }))
    setTSApiKeys(temp_tsApiKeys)
  },[apiKeys])

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
    <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col items-start justify-between space-y-2">
          <CustomHeading
          title="API Keys"
          description={
            <>
              Create a key that unlocks full API access to this project. 
              <a href="https://docs.panora.dev/core-concepts/auth#learn-how-to-generate-your-api-keys-and-catch-connection-tokens" target="_blank" rel="noopener noreferrer"> More details in <strong>our documentation</strong></a>.
            </>
          }
          />
        </div>          
        <div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="h-7 gap-1" 
              onClick={() => {
                posthog?.capture("add_new_api_key_button_clicked", {
                  id_project: idProject,
                  mode: config.DISTRIBUTION
              })}}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create New Api Key
              </span>
            </Button>
            </DialogTrigger>
            <DialogContent>
              {idProject==="" ? (
                <>
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                </DialogHeader>
                <h1>You have to create project in order to create API Key.</h1>
                <DialogFooter>
                  <Button variant='outline' type="reset" onClick={() => onCancel()}>Close</Button>
                </DialogFooter>
                </>
              )
              :
              (
                <>
                <DialogHeader>
                  <DialogTitle>Create a new API key</DialogTitle>
                  <DialogDescription>
                  Keep your key safe. <br></br>Save and store this new key to a secure place, such as a password manager or secret store. You will not be able to see it again.
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
                              <FormLabel>Name your API key</FormLabel>
                              <FormControl>
                                <Input 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                placeholder="Your awesome key name" {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                      />
                    </div>
                  </div>
                <DialogFooter>
                  <Button variant='outline' type="reset" size="sm" className="h-7 gap-1" onClick={() => onCancel()}>Cancel</Button>
                  <Button type='submit' size="sm" className="h-7 gap-1">
                    Create
                  </Button>
                </DialogFooter>
                  </form>
                </Form>
                </>
              )}
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