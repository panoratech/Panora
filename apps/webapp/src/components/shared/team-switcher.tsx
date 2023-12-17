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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useProjectMutation from "@/hooks/mutations/useProjectMutation"
import useOrganisationMutation from "@/hooks/mutations/useOrganisationMutation"
import { useEffect, useState } from "react"
import useProjectStore from "@/state/projectStore"
import useOrganisationStore from "@/state/organisationStore"
import useProfileStore from "@/state/profileStore"
import useProjects from "@/hooks/useProjects"
import { Skeleton } from "../ui/skeleton"
import useOrganisations from "@/hooks/useOrganisations"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {}

interface ModalObj {
  open: boolean;
  status?: number; // 0 for org, 1 for project
}

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false)

  const [showNewDialog, setShowNewDialog] = useState<ModalObj>({
    open: false,
  })

  const [orgName, setOrgName] = useState('');
  const [projectName, setProjectName] = useState('');

  const { data : orgs, isLoading: isloadingOrganisations } = useOrganisations();
  const { data : projects, isLoading: isloadingProjects } = useProjects();

  const { idProject, setIdProject } = useProjectStore();
  const { idOrg, setIdOrg, setOrganisationName } = useOrganisationStore();
  
  const { profile } = useProfileStore();

  
  useEffect(()=>{
    if(projects && projects[0]){      
      setIdProject(projects[0].id_project);
    }
    if(orgs && orgs[0]){
      setOrganisationName(orgs[0].name);
      setIdOrg(orgs[0].id_organization);
    }
  },[projects, orgs, setIdProject, setIdOrg, setOrganisationName])

  const handleOpenChange = (open: boolean) => {
    setShowNewDialog(prevState => ({ ...prevState, open }));
  };

  const { mutate: mutateProject } = useProjectMutation();
  const { mutate: mutateOrganisation } = useOrganisationMutation();

  //TODO
  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    mutateOrganisation({ 
      name: orgName, 
      stripe_customer_id: "stripe-customer-76",
    });
    setShowNewDialog({open: false})  
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    mutateProject({ 
      name: projectName, 
      id_organization: profile!.id_organization,
    });
    setShowNewDialog({open: false})  
  };

  

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
            {projects && projects.length > 0 ? projects[0].name : isloadingProjects ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : "No projects found"}
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
                    !isloadingProjects && projects && projects.length > 0 ? projects.map((project) => (
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
                            <Skeleton className="w-[100px] h-[20px] rounded-md" />
                          </CommandItem>
                        )
                    )
                  }
                </CommandGroup>
                <CommandGroup key={"organisations"} heading={"Organisations"}>
                  {!isloadingOrganisations && orgs && orgs.length > 0 ? 
                    <CommandItem
                      key={orgs[0] ? orgs[0].id_organization: ""}
                      onSelect={() => {
                        setIdOrg(orgs[0] ? orgs[0].id_organization : "")
                        setOpen(false)
                      }}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${orgs[0].name}.png`}
                          alt={orgs[0].name}
                          className="grayscale"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      {orgs[0].name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          orgs && orgs.length > 0 && orgs[0] && idOrg === orgs[0].id_organization 
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  : 
                    <CommandItem
                      key={"0"}
                      className="text-sm"
                    >
                      <Skeleton className="w-[100px] h-[20px] rounded-md" />
                    </CommandItem>
                  }
                </CommandGroup>
              
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewDialog({open: true, status: 0})
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Organisation
                  </CommandItem>
                </DialogTrigger>
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
          <form onSubmit={handleOrgSubmit}>
            <DialogHeader>
              <DialogTitle>Create organisation</DialogTitle>
              <DialogDescription>
                Add a new organisation to manage your integrations.
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organisation name</Label>
                  <Input 
                    id="name" 
                    placeholder="Acme Inc." 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
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
          </> : 
          <>
          <form onSubmit={handleProjectSubmit}>
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>
                Add a new project to manage your integrations.
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project name</Label>
                  <Input 
                    id="name" 
                    placeholder="Project Inc." 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
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
          </>
        }
      </DialogContent>
    </Dialog>
  )
}