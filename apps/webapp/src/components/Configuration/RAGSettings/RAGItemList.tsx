import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { vectorDatabases, embeddingModels } from "./utils"
import { useRagItem } from "./useRAGItem"

interface RAGItemListProps {
  items: (typeof vectorDatabases[number] | typeof embeddingModels[number])[];
  type: string;
}

export function RAGItemList({ items, type }: RAGItemListProps) {
  const [ragItem, setRagItem] = useRagItem()
  
  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={cn(
              "justify-start",
              ragItem.selected === item.name && ragItem.type === type && "bg-muted"
            )}
            onClick={() => setRagItem({ selected: item.name, type })}
          >
            <img
              src={item.logoPath}
              alt={item.name}
              className="mr-2 h-4 w-4 rounded-md"
            />
            {item.name}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}