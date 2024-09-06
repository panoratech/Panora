import { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConnector } from "./useConnector"
import { AuthStrategy, Provider } from "@panora/shared"

interface ConnectorListProps {
  items: Provider[]
}

export function ConnectorList({ items }: ConnectorListProps) {
  const [connector, setConnector] = useConnector()
  
  return (
    <ScrollArea className="h-full max-h-[calc(100vh-150px)] overflow-y-auto">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={`${item.vertical}-${item.name}`}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
              connector.selected === `${item.vertical}-${item.name}` && "border border-sky-700"
            )}
            onClick={() =>
              setConnector({
                ...connector,
                selected: `${item.vertical}-${item.name}`,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    <img src={item.logoPath} className="w-8 h-8 rounded-lg"/>
                  </div>
                  <div className="font-semibold">{`${item.name.substring(0,1).toUpperCase()}${item.name.substring(1)}`}</div>
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    connector.selected === `${item.vertical}-${item.name}`
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                />
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.description!.substring(0, 300)}
            </div>
            <div className="flex items-center gap-2">
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
          </button>
        ))}
      </div>
    </ScrollArea>
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
