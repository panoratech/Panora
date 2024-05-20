import * as React from "react"
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useEffect } from "react"
import { scopes } from "@panora/shared"

export function DataTableFacetedFilterWebhook({ title, field }: { title?: string, field: any }) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set());
  const [selectedAll, setSelectedAll] = React.useState(false);

  useEffect(() => {
    if (field.value && field.value.trim() !== "") {
      setSelectedValues(new Set(field.value.split(' ')));
    }
  }, [field.value]);

  const handleAddScope = (scope: string) => {
    if (scope && !selectedValues.has(scope)) {
      const newSelectedValues = new Set([...selectedValues, scope]);
      setSelectedValues(newSelectedValues);
      field.onChange(Array.from(newSelectedValues).join(' '));
      setInputValue("");
    }
  };

  const handleRemoveScope = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    newSelectedValues.delete(value);
    setSelectedValues(newSelectedValues);
    field.onChange(Array.from(newSelectedValues).join(' '));
  };

  const handleClearScopes = () => {
    setSelectedValues(new Set());
    field.onChange('');
  };

  const handleSelectAll = () => {
    if (selectedValues.size === scopes.length) {
      setSelectedAll(false);
      handleClearScopes();
    } else {
      const allScopes = new Set(scopes);
      setSelectedValues(allScopes);
      field.onChange(Array.from(allScopes).join(' '));
      setSelectedAll(true);
    }
  };

  const filteredScopes = scopes.filter(scope =>
    scope.toLowerCase().includes(inputValue.toLowerCase()) && !selectedValues.has(scope)
  );

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  Array.from(selectedValues).map((value) => (
                    <Badge
                      variant="secondary"
                      key={value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {value}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList className="overflow-y-auto max-h-60">
            <CommandGroup>
              <CommandItem
                onSelect={handleSelectAll}
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                  )}
                >
                  {selectedAll && <CheckIcon className={cn("h-4 w-4")} />}
                </div>
                <span>Select All</span>
              </CommandItem>
              {Array.from(selectedValues).map((value) => (
                <CommandItem
                  key={value}
                  onSelect={() => handleRemoveScope(value)}
                >
                  <div
                    className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    <CheckIcon className={cn("h-4 w-4")} />
                  </div>
                  <span>{value}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              {filteredScopes.map((scope) => (
                <CommandItem
                  key={scope}
                  onSelect={() => handleAddScope(scope)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
                    )}
                  >
                    {selectedValues.has(scope) && <CheckIcon className={cn("h-4 w-4")} />}
                  </div>
                  <span>{scope}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearScopes}
                    className="justify-center text-center"
                  >
                    Clear scopes
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
