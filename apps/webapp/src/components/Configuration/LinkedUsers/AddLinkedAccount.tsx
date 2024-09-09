'use client'

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useCreateLinkedUser from "@/hooks/create/useCreateLinkedUser"
import useProjectStore from "@/state/projectStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { FileUploader } from "@/components/ui/file-uploader"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"
import useCreateBatchLinkedUser from "@/hooks/create/useCreateBatchLinkedUser"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Confetti from 'react-confetti-boom';

interface LinkedUserModalObj {
  open: boolean;
  import?: boolean;
}
const formSchema = z.object({
  linkedUserIdentifier: z.string().min(2, {
    message: "linkedUserIdentifier must be at least 2 characters.",
  })
})

const AddLinkedAccount = () => {
  const [open, setOpen] = useState(false)
  const [showNewLinkedUserDialog, setShowNewLinkedUserDialog] = useState<LinkedUserModalObj>({
    open: false,
    import: false
  })
  const [files, setFiles] = useState<File[]>([])
  const [successImporting, setSuccessImporting]=useState(false)
  const { createLinkedUserPromise } = useCreateLinkedUser();
  const { createBatchLinkedUserPromise } = useCreateBatchLinkedUser();

  const queryClient = useQueryClient();

  const handleOpenChange = (open: boolean) => {
    setShowNewLinkedUserDialog(prevState => ({ ...prevState, open }));
    form.reset()
  };

  const posthog = usePostHog()

  const {idProject} = useProjectStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedUserIdentifier: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(
      createLinkedUserPromise({ 
        linked_user_origin_id: values.linkedUserIdentifier, 
        alias: "", //TODO
        id_project: idProject
      }), 
      {
      loading: 'Loading...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(['linked-users'], (oldQueryData = []) => {
          return [...oldQueryData, data];
        });
        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Linked account
              <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.linked_user_origin_id}`}</Badge>
              has been created
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
    });
    setShowNewLinkedUserDialog({open: false})  
    posthog?.capture("linked_account_created", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    form.reset()
  }
  
  const handleImport = async () => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = async (e) => {
      const text = e.target?.result;
      if (text) {
        console.log("values of text file "+ (text as string))
        const ids = (text as string).split(',');
        toast.promise(
          createBatchLinkedUserPromise({ 
            linked_user_origin_ids: ids, 
            alias: "", //TODO
            id_project: idProject
          }), 
          {
          loading: 'Loading...',
          success: (data: any) => {
            queryClient.setQueryData<any[]>(['linked-users'], (oldQueryData = []) => {
              return [...oldQueryData, data];
            });
            setSuccessImporting(true);
            setShowNewLinkedUserDialog({open: false, import:false})
            return (
              <div className="flex flex-row items-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <div className="ml-2">
                  Linked accounts have been imported 
                </div>
              </div>
            )
            ;
          },
          error: (err: any) => err.message || 'Error'
        });
        posthog?.capture("batch_linked_account_created", {
          id_project: idProject,
          mode: config.DISTRIBUTION
        })
      }
    };
    reader.readAsText(file);
  };


  return (
    <Dialog open={showNewLinkedUserDialog.open} onOpenChange={handleOpenChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
              size="sm" 
              className="h-7 w-[150px] gap-1" 
            >
              <span className="flex flex-row justify-center sr-only sm:not-sr-only sm:whitespace-nowrap">
              <PlusCircledIcon className="h-3.5 w-3.5 mt-[3px] mr-1" />
              Add Linked Users
              </span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0 ml-20">
          <Command>
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewLinkedUserDialog({
                          open: true,
                          import: false
                      })
                      posthog?.capture("add_linked_user_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      })
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <p className="ml-2">Add New Linked User</p>

                  </CommandItem>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewLinkedUserDialog({
                        open: true,
                        import: true
                      })
                      posthog?.capture("import_linked_user_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      })
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <p className="ml-2">Import your Linked Users</p>
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showNewLinkedUserDialog.import ? "Import your linked users": "Create a new linked user"}</DialogTitle>
          <DialogDescription>
            {showNewLinkedUserDialog.import ? "You can upload a sheet of your existing linked users" : "Add a new linked user to your project"}
          </DialogDescription>
        </DialogHeader>
        { !showNewLinkedUserDialog.import ? 
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className="space-y-4 py-2 pb-4">
              
                      <div className="space-y-2">
                      <FormField
                            control={form.control}
                            name="linkedUserIdentifier"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Origin User Identifier</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="acme-inc-user-123" {...field} 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                                  />
                                </FormControl>
                                <FormDescription>
                                  This is the id of the user in your system.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                        />
                      </div>
              
                
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="h-7 gap-1"  type='reset' onClick={() => {form.reset(); setShowNewLinkedUserDialog({open: false})}}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 gap-1" >Create</Button>
            </DialogFooter>
            </form>
          </Form>
        : 
          <div>
            <>
            {successImporting && <Confetti mode="boom" particleCount={50} colors={['#ff577f', '#ff884b']}/>}
              <FileUploader
                maxFiles={1}
                maxSize={8 * 1024 * 1024} // 8 MB file size limit
                onValueChange={setFiles}
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" size="sm" className="h-7 gap-1"  type='reset' onClick={() => {form.reset(); setShowNewLinkedUserDialog({open: false})}}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-7 gap-1" onClick={handleImport}>Import</Button>
              </DialogFooter>
            </>
            
          </div>  
        }
        
      </DialogContent>
    </Dialog>    
  )
}

export default AddLinkedAccount;