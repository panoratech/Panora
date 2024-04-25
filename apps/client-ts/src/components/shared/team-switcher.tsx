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
import useProjectMutation from "@/hooks/mutations/useProjectMutation"
import { useEffect, useState } from "react"
import useProjectStore from "@/state/projectStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import config from "@/lib/config"
import { Skeleton } from "@/components/ui/skeleton";
import useProfileStore from "@/state/profileStore"
import useProjectsStore from "@/state/projectsStore"
import { projects as Project } from 'api';


const projectFormSchema = z.object({
  projectName: z.string().min(2, {
    message: "projectName must be at least 2 characters.",
  })
})

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {
  userId: string;
  projects: Project[]
}

interface ModalObj {
  open: boolean;
  status?: number; // 0 for org, 1 for project
}

export default function TeamSwitcher({ className, userId,projects }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState<ModalObj>({
    open: false,
  })

  const { idProject, setIdProject } = useProjectStore();
  
  const { profile } = useProfileStore();
  // const {projects,setProjects} = useProjectsStore();

  // console.log("Projects in team switcher : ",projects);

  const handleOpenChange = (open: boolean) => {
    setShowNewDialog(prevState => ({ ...prevState, open }));
  };

  const { mutate: mutateProject } = useProjectMutation();

  useEffect(() => {
    if(idProject==="")
      {
        setIdProject(projects[0]?.id_project)
      }
  },[projects])

  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: "",
    },
  })

  function onProjectSubmit(values: z.infer<typeof projectFormSchema>) {
    console.log(values)
    mutateProject({ 
      name: values.projectName, 
      id_user: profile!.id_user,
    });
    setShowNewDialog({open: false})  
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
            className={cn("w-[250px] justify-between", className)}
          >
            {
               projects && projects.length > 0
               ? projects.find(p => p.id_project === idProject)?.name || "Selected project not found"
               : "No projects found"
            }
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 ml-20">
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
                    )) : Array.from({ length: 6 }).map((_, index) => (
                          <CommandItem
                            key={index}
                            className="text-sm"
                          >
                            <p>No Projects Found</p>
                            {/* <Skeleton className="w-[100px] h-[20px] rounded-md" /> */}
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
                    <h4>{profile ? profile.email : "no profile"}</h4>
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
          <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} >
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
              <Button variant="outline" onClick={() => setShowNewDialog({open:false})}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
          </Form>
          </>
        }
      </DialogContent>
    </Dialog>
  )
}