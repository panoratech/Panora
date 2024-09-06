"use client"

import * as React from "react"
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import useProjectMutation from "@/hooks/create/useCreateProject"
import { useEffect, useState } from "react"
import useProjectStore from "@/state/projectStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import config from "@/lib/config"
import { Skeleton } from "@/components/ui/skeleton";
import useProfileStore from "@/state/profileStore"
import { projects as Project } from 'api';
import useRefreshAccessTokenMutation from "@/hooks/create/useRefreshAccessToken"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "../ui/badge"

const projectFormSchema = z.object({
  projectName: z.string().min(2, {
    message: "projectName must be at least 2 characters.",
  })
})

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {
  projects: Project[]
}

interface ModalObj {
  open: boolean;
  status?: number; // 0 for org, 1 for project
}

export default function TeamSwitcher({ className ,projects}: TeamSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState<ModalObj>({
    open: false,
  })
  

  const { profile } = useProfileStore();

  const { idProject, setIdProject } = useProjectStore();
  const { mutate : refreshAccessToken } = useRefreshAccessTokenMutation()

  const handleOpenChange = (open: boolean) => {
    setShowNewDialog(prevState => ({ ...prevState, open }));
  };

  const queryClient = useQueryClient();

  const { createProjectsPromise } = useProjectMutation();

  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: "",
    },
  })

  function onProjectSubmit(values: z.infer<typeof projectFormSchema>) {
    toast.promise(
      createProjectsPromise({ 
        name: values.projectName, 
        id_user: profile!.id_user,
      }),
      {
      loading: 'Loading...',
      success: (data: any) => {
        queryClient.setQueryData<any[]>(['projects'], (oldQueryData = []) => {
            return [...oldQueryData, data];
        });
        return (
          <div className="flex flex-row items-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <div className="ml-2">
              Project
              <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.name}`}</Badge>
              has been created
            </div>
          </div>
        )
        ;
      },
      error: (err: any) => err.message || 'Error'
    });
    setShowNewDialog({open: false})  
    projectForm.reset();
  }

  const onClose = () => {
    setShowNewDialog({open:false})
    projectForm.reset();
  }
  

  return (
    <Dialog open={showNewDialog.open} onOpenChange={handleOpenChange}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[250px] justify-between rounded-xl", className)}
          >
            {
               projects && projects.length > 0
               ? <>
                  <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${projects.find(p => p.id_project === idProject)?.name}.png`}
                alt={projects.find(p => p.id_project === idProject)?.name}
                className=""
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
                  {projects.find(p => p.id_project === idProject)?.name || "Selected project not found"}
                </> : "No projects found"
            }
            
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 ml-4">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>Not found.</CommandEmpty>
                <CommandGroup key={"projects"} heading={"Projects"}>
                  {
                    projects && projects.length > 0 ? projects.map((project) => (
                      <CommandItem
                        key={project.id_project}
                        onSelect={() => {
                          setIdProject(project.id_project)
                          refreshAccessToken(project.id_project)
                          setOpen(false)
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${project.name}.png`}
                            alt={project.name}
                            className=""
                          />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {project.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            projects && projects.length > 0 && idProject === project.id_project
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )) : projects && projects.length === 0 ? <p className="px-2 text-sm">No projects found !</p>
                    
                    : Array.from({ length: 6 }).map((_, index) => (
                          <CommandItem
                            key={index}
                            className="text-sm"
                          >
                            <Skeleton className="w-[100px] h-[20px] rounded-md" />
                          </CommandItem>
                        )
                    )
                  }
                </CommandGroup>              
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                {
                  config.DISTRIBUTION === "managed" && (
                    <p className="px-2 text-sm mb-2">{profile ? profile.email : "no profile"}</p>
                  )
                }
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewDialog({open: true, status: 1})
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Project
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        {showNewDialog.status == 0 ? 
          <>
          </> : 
          <>
          <Form {...projectForm}>
          <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} onReset={() => onClose()}>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>
                Add a new project to manage your integrations.
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <FormField
                      control={projectForm.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Project Inc." {...field} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"                              
                            />
                          </FormControl>
                          <FormDescription>
                            This is your project name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="reset" size="sm" className="h-7 gap-1">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 gap-1" >Create</Button>
            </DialogFooter>
          </form>
          </Form>
          </>
        }
      </DialogContent>
    </Dialog>
  )
}