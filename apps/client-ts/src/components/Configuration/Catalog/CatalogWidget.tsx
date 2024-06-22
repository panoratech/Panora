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
import { toast } from "sonner"

export const verticals = categoriesVerticals as string[];

export function CatalogWidget() {
    const [vertical, setVertical] = useState("All")
    const [connectorStatuses, setConnectorStatuses] = useState<{ [key: string]: boolean }>({});

    const filteredConnectors = vertical === "All"
        ? providersArray()
        : providersArray(vertical);

    const {idProject} = useProjectStore();

    const {data} = useProjectConnectors(idProject);

    const {updateProjectConnectorPromise} = useUpdateProjectConnectors();

    useEffect(() => {
      if (data) {
          const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
              if (key !== 'id_connector_set') {
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
        toast.promise(
          updateProjectConnectorPromise({
            column: providerKey,
            status: newStatus
        }), 
            {
            loading: 'Loading...',
            success: (data: any) => {
              return (
                  <div className="flex flex-row items-center">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <div className="ml-2">
                      Changes have been saved
                  </div>
                  </div>
              )
              ;
            },
            error: (err: any) => err.message || 'Error'
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
                  {item.authStrategy.strategy && 
                    <Badge key={item.authStrategy.strategy} variant={getBadgeVariantFromLabel(item.authStrategy.strategy)}>
                      {item.authStrategy.strategy}
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
