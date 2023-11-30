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

const groups = [
  {
    label: "Projects",
    teams: [
      {
        label: "Financial Project",
        value: "personal",
      },
      {
        label: "Data Project",
        value: "personal1",
      },
      {
        label: "Marketing Project",
        value: "personal2",
      },
    ],
  },
  {
    label: "Teams",
    teams: [
      {
        label: "Acme Inc.",
        value: "acme-inc",
      },
      {
        label: "Monsters Inc.",
        value: "monsters",
      },
    ],
  },
]

type Team = (typeof groups)[number]["teams"][number]

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {}

interface ModalObj {
  open: boolean;
  status?: number; // 0 for org, 1 for project
}

export default function TeamSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(
    groups[0].teams[0]
  )

  const [showNewDialog, setShowNewDialog] = React.useState<ModalObj>({
    open: false,
  })

  const handleOpenChange = (open: boolean) => {
    setShowNewDialog(prevState => ({ ...prevState, open }));
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
           
            {selectedTeam.label}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 ml-20">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.teams.map((team) => (
                    <CommandItem
                      key={team.value}
                      onSelect={() => {
                        setSelectedTeam(team)
                        setOpen(false)
                      }}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${team.value}.png`}
                          alt={team.label}
                          className="grayscale"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      {team.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedTeam.value === team.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
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
                  <Input id="name" placeholder="Acme Inc." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog({open:false})}>
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </> : 
          <>
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
                  <Input id="name" placeholder="Project Inc." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog({open:false})}>
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </>
        }
      </DialogContent>
    </Dialog>
  )
}