'use client'

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import useOrganisationStore from "@/state/organisationStore"
import useProjectStore from "@/state/projectStore"
import useCreateMagicLink from "@/hooks/create/useCreateMagicLink"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/lib/config"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import useMagicLinkStore from "@/state/magicLinkStore"
import useLinkedUsers from "@/hooks/get/useLinkedUsers"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const formSchema = z.object({
  linkedUserIdentifier: z.string().min(2, {
    message: "linkedUserIdentifier must be at least 2 characters.",
  }),
  linkedUserMail: z.string().min(2, {
    message: "linkedUserMail must be at least 2 characters.",
  }),
})
interface LinkedUserModalObj {
  open: boolean;
  import?: boolean;
}

const AddConnectionButton = ({
    setIsGenerated
}: {setIsGenerated: (generated: boolean) => void}) => {
  const [open, setOpen] = useState(false)
  const [showNewLinkedUserDialog, setShowNewLinkedUserDialog] = useState<LinkedUserModalObj>({
    open: false,
    import: false
  })

  const handleOpenChange = (open: boolean) => {
    setShowNewLinkedUserDialog(prevState => ({ ...prevState, open }));
  };

  const posthog = usePostHog()

  const { createMagicLinkPromise } = useCreateMagicLink();
  const {setUniqueLink} = useMagicLinkStore();
  const {nameOrg} = useOrganisationStore();
  const {idProject} = useProjectStore();
  const queryClient = useQueryClient();
  const {data: linkedUsers} = useLinkedUsers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedUserIdentifier: "",
      linkedUserMail: ""
    },
  })

  const onUserSelect = (value: string) => {
    if (value === 'Clear') {
      form.reset(); 
    } else {
      form.setValue('linkedUserIdentifier', value);
    }
  };

 
  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(
      createMagicLinkPromise({ 
        linked_user_origin_id: values.linkedUserIdentifier, 
        email: values.linkedUserMail,
        alias: nameOrg,
        id_project: idProject
      }),
      {
      loading: 'Loading...',
      success: (data: any) => {
        setUniqueLink(data.id_invite_link);
        queryClient.setQueryData<any[]>(['magic-links'], (oldQueryData = []) => {
            return [...oldQueryData, data];
        });
        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Magic Link has been created
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
    });

    posthog?.capture("magic_link_created", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    
    setIsGenerated(true);
    form.reset()
  }

  const onClose = () => {
    setShowNewLinkedUserDialog({open: false})
    form.reset();
  }
  
  return (
    <Dialog open={showNewLinkedUserDialog.open} onOpenChange={handleOpenChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm" 
            className="h-7 gap-1 w-[180px]"
          >
            <PlusCircledIcon className="mr-1 h-4.5 w-4.5" />
            Create Magic Link
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
                      posthog?.capture("create_magic_link_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      })
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <p className="ml-2">Create a unique magic link</p>
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
                      posthog?.capture("create_batch_magic_link_button_clicked", {
                        id_project: idProject,
                        mode: config.DISTRIBUTION
                      })
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <p className="ml-2">Generate a batch of magic links</p>
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover> 
      <DialogContent>
        {idProject==="" ? (
          <>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
              <h1>You have to create project in order to create Connection.</h1>
              <DialogFooter>
                <Button variant='outline' type="reset" onClick={() => setShowNewLinkedUserDialog({open: false})}>Close</Button>
              </DialogFooter>
          </>
        )
      :
      (
        <>
        <DialogHeader>
          <DialogTitle>Share this magic link with your customers</DialogTitle>
          <DialogDescription>
            {showNewLinkedUserDialog.import ? "You can upload a sheet of your existing customers" : "Panora's Magic Link allows you to deliver an in-browser Panora Link experience and let users grant you access to their account. Send your users secure URLs to authorize their integrations in production without frontend code."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onReset={() => onClose()} >
        <div>
          <div className="space-y-4 py-2 pb-4">
            {!showNewLinkedUserDialog.import ?
              ( <>
                <div>
                {linkedUsers && linkedUsers.length > 0 && (
                        <FormField
                        control={form.control}
                        name="linkedUserIdentifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select an Existing Linked User</FormLabel>
                            <FormControl>
                              <Select onValueChange={onUserSelect} defaultValue={field.value}>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select an object" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                  <SelectItem key="clear_value" value="Clear">Clear</SelectItem>
                                    {linkedUsers.map(user => (
                                      <SelectItem key={user.id_linked_user} value={user.linked_user_origin_id}>{user.linked_user_origin_id}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Select from existing linked users or create a new identifier.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}
                </div>
                <div className="space-y-2 items-center gap-4">
                    <FormField
                        control={form.control}
                        name="linkedUserIdentifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin User Identifier</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder='ex: "johndoe123_crm", or "johndoe123_ticketing"' {...field} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                              />
                            </FormControl>
                            <FormDescription>
                            Uniquely identifies Linked Accounts. An end-user should have one for each third-party account connected.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-2 items-center gap-4">
                    <FormField
                        control={form.control}
                        name="linkedUserMail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin User Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="steve@apple.inc" {...field} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                              />
                            </FormControl>
                            <FormDescription>
                            For identification purposes — we will not send anything.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                    />
                </div>
                </>
              ) : 
              <>
                <div className="space-y-2">
                  <Label htmlFor="picture">Upload your file</Label>
                  <Input className="h-20" id="picture" type="file" />
                </div>
              </>
            }
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" type="reset" className="h-7 gap-1">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size="sm" className="h-7 gap-1">Create Magic Link</Button>
        </DialogFooter>
        </form>
        </Form>
        </>
      )}
      </DialogContent>
    </Dialog>    
  )
}

export default AddConnectionButton;