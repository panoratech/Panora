"use client"

import * as React from "react"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command" 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useVerticalStore from "@/state/verticalStore"
import { categoriesVerticals } from '@panora/shared';
import { Separator } from "@/components/ui/separator"

export const verticals = categoriesVerticals as string[];

export function VerticalSelector({ onSelectVertical }: { onSelectVertical: (vertical: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [selectedVertical, setSelectedVertical] = React.useState<string>("")
  const { setVertical } = useVerticalStore();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Select category"
          aria-expanded={open}
          className="flex-1 justify-between md:max-w-[100px] lg:max-w-[200px] mx-2"
        >
          {selectedVertical ? selectedVertical : "Select category"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No verticals found.</CommandEmpty>
          <CommandGroup heading="Categories">
            <CommandItem
                key={"All"}
                onSelect={() => {
                  setVertical("All")
                  setSelectedVertical("All")
                  setOpen(false)
                  onSelectVertical("All")
                }}
              >
                All
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedVertical === "All"
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            <Separator  />
            {verticals.map((vertical) => (
              <CommandItem
                key={vertical}
                onSelect={() => {
                  setVertical(vertical)
                  setSelectedVertical(vertical)
                  setOpen(false)
                  onSelectVertical(vertical)
                }}
              >
                {vertical}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedVertical === vertical
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
