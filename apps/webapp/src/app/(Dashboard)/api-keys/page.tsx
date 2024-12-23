'use client'

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
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTableLoading } from "@/components/shared/data-table-loading";
import {CustomHeading}  from "@/components/shared/custom-heading";
import { useColumns } from "@/components/ApiKeys/columns";
import { PlusCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  apiKeyIdentifier: z.string().min(2, {
    message: "apiKeyIdentifier must be at least 2 characters.",
  })
})
interface TSApiKeys {
  id_api_key: string;
  name : string;
}

export default function Page() {
  const [open,setOpen] = useState(false)
  const [tsApiKeys,setTSApiKeys] = useState<TSApiKeys[] | undefined>([])
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);


  const queryClient = useQueryClient();
  const [newApiKey, setNewApiKey] = useState<{ key: string; expiration: Date } | null>(null);
  const {idProject} = useProjectStore();
  const {profile} = useProfileStore();
  const { createApiKeyPromise } = useCreateApiKey();
  const { data: apiKeys, isLoading, error } = useApiKeys();
  const columns = useColumns();

  useEffect(() => {
    if (newApiKey) {
      const timeUntilExpiration = newApiKey.expiration.getTime() - Date.now();
      const timer = setTimeout(() => {
        setNewApiKey(null);
      }, timeUntilExpiration);
  
      return () => clearTimeout(timer);
    }
  }, [newApiKey]);

  useEffect(() => {
    const temp_tsApiKeys = apiKeys?.map((key) => ({
      id_api_key: key.id_api_key,
      name: key.name || "",
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
    toast.promise(
      createApiKeyPromise({ 
        userId: profile!.id_user,
        projectId: idProject,
        keyName: values.apiKeyIdentifier
      }), 
      {
      loading: 'Loading...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(['api-keys'], (oldQueryData = []) => {
          return [...oldQueryData, data];
        });
        // Store the API key and its expiration time in state
        setNewApiKey({
          key: data.api_key,
          expiration: new Date(Date.now() + 60000),
        });
        setIsKeyModalOpen(true); // Open the modal

        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Api key
              <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.name}`}</Badge>
              has been created
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
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
                Create API key
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
      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your New API Key</DialogTitle>
          <DialogDescription>
            This key will only be shown for the next minute. Please save it now.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-between gap-2 rounded-md border p-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {newApiKey?.key}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (newApiKey?.key) {
                navigator.clipboard.writeText(newApiKey.key);
                toast.success("API key copied to clipboard");
              }
            }}
            className={cn(
              "h-8 w-8",
              "hover:bg-muted",
              "focus-visible:ring-1",
              "focus-visible:ring-ring",
              "focus-visible:ring-offset-0"
            )}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy API key</span>
          </Button>
        </div>
        <DialogFooter>
          <Button size="sm" className="h-7 gap-1" onClick={() => setIsKeyModalOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}