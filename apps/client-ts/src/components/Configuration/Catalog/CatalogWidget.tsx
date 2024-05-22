import { ComponentProps, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthStrategy, categoriesVerticals, ConnectorCategory, providersArray, slugFromCategory } from "@panora/shared"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import useProjectStore from "@/state/projectStore"
import useUpdateProjectConnectors from "@/hooks/update/useUpdateProjectConnectors"
import useProjectConnectors from "@/hooks/get/useProjectConnectors"

export const verticals = categoriesVerticals as string[];

export function CatalogWidget() {
    const [vertical, setVertical] = useState("All")
    const [connectorStatuses, setConnectorStatuses] = useState<{ [key: string]: boolean }>({});

    const filteredConnectors = vertical === "All"
        ? providersArray()
        : providersArray(vertical);

    const {idProject} = useProjectStore();
    
    const {data} = useProjectConnectors(idProject);

    const {mutate} = useUpdateProjectConnectors();

    useEffect(() => {
      if (data) {
          const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
              if (key !== 'id_project' && key !== 'id_project_connector') {
                  acc[key] = Boolean(value);
              }
              return acc;
          }, {} as { [key: string]: boolean });
          
          setConnectorStatuses(filteredData);
      }
  }, [data]);

    const handleCheckboxChange = (vertical: string) => {
        setVertical(vertical);
    };

    const handleSwitchChange = async (providerKey: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        setConnectorStatuses(prev => ({
            ...prev,
            [providerKey]: newStatus
        }));

        mutate({
            column: providerKey,
            status: newStatus
        });
    };

  return (
    <>
    <div className="flex items-center justify-between w-full">

      <div className="flex items-center gap-2">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-2 text-sm px-4 mb-2"
                  >
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Filter By Category</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                      key={"All"}
                      checked={vertical == "All"}
                      onCheckedChange={() => handleCheckboxChange("All")}
                  >
                      All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {verticals.map((v) => (
                      <DropdownMenuCheckboxItem
                          key={v}
                          checked={vertical == v}
                          onCheckedChange={() => handleCheckboxChange(v)}
                      >
                          {v}
                      </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>

    <ScrollArea className="h-full max-h-[calc(100vh-150px)] overflow-y-auto mt-2">
      <div className="flex flex-col gap-2 pt-0">
        {filteredConnectors.map((item) => {
          const providerKey = `${slugFromCategory(item.vertical! as ConnectorCategory)}_${item.name}`;
          const isChecked = connectorStatuses[providerKey] ?? true; // Default to true if undefined

          return (
            <Card
            key={providerKey}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
              "border"
            )}
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <img src={item.logoPath} className="w-8 h-8 rounded-lg" />
                  <div className="font-semibold">{`${item.name.substring(0, 1).toUpperCase()}${item.name.substring(1)}`}</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {item.description!.substring(0, 300)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {item.vertical && 
                    <Badge key={item.vertical} variant={getBadgeVariantFromLabel(item.vertical)}>
                      {item.vertical}
                    </Badge>
                  }
                  {item.authStrategy && 
                    <Badge key={item.authStrategy} variant={getBadgeVariantFromLabel(item.authStrategy)}>
                      {item.authStrategy}
                    </Badge>
                  }
                </div>
              </div>
              <div>
              <Switch 
                className="data-[state=checked]:bg-sky-700" 
                id="necessary" 
                checked={isChecked} 
                onCheckedChange={() => handleSwitchChange(providerKey, isChecked)} 
              />
              </div>
            </div>
            </Card>
          )})
        }
      </div>
    </ScrollArea>
    </>
  )
}

function getBadgeVariantFromLabel(
  label?: string
): ComponentProps<typeof Badge>["variant"] {
  if (label === AuthStrategy.oauth2) {
    return "secondary"
  }
  return "default"
}
