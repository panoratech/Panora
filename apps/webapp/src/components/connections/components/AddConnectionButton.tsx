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
import { cn } from "@/lib/utils"
import { useState } from "react"
import useOrganisationStore from "@/state/organisationStore"
import useProjectStore from "@/state/projectStore"
import useMagicLinkMutation from "@/hooks/mutations/useMagicLinkMutation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { usePostHog } from 'posthog-js/react'
import config from "@/utils/config"

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

  const { mutate, isError, error } = useMagicLinkMutation();

  const {nameOrg} = useOrganisationStore();
  const {idProject} = useProjectStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedUserIdentifier: "",
      linkedUserMail: ""
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    mutate({ 
      linked_user_origin_id: values.linkedUserIdentifier, 
      email: values.linkedUserMail,
      alias: nameOrg,
      id_project: idProject
    });

    if(isError) {
      console.log(error);
    }
    
    posthog?.capture("magic_link_created", {
      id_project: idProject,
      mode: config.DISTRIBUTION
    })
    
    setIsGenerated(true);
  }
  
  return (
    <Dialog open={showNewLinkedUserDialog.open} onOpenChange={handleOpenChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[180px] justify-between")}
          >
            <PlusCircledIcon className="mr-2 h-5 w-5" />
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
        <DialogHeader>
          <DialogTitle>Share this magic link with your customers</DialogTitle>
          <DialogDescription>
            {showNewLinkedUserDialog.import ? "You can upload a sheet of your existing customers" : "Generate a unique link for your customer"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} >
        <div>
          <div className="space-y-4 py-2 pb-4">
            {!showNewLinkedUserDialog.import ?
              ( <>
                <div className="space-y-2 items-center gap-4">
                    <FormField
                        control={form.control}
                        name="linkedUserIdentifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin User Identifier</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="acme-inc-user-123" {...field} 
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
                <div className="space-y-2 items-center gap-4">
                    <FormField
                        control={form.control}
                        name="linkedUserMail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin User Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="joedoe@acme.inc" {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This is the email of the user in your system.
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
          <Button variant="outline" onClick={() => setShowNewLinkedUserDialog({open: false})}>
            Cancel
          </Button>
          <Button variant="outline" type="submit">Generate</Button>
        </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>    
  )
}

export default AddConnectionButton;