import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search } from "lucide-react"
import * as React from "react"
import { RAGItemDisplay } from "./RAGItemDisplay"
import { RAGItemList } from "./RAGItemList"
import { embeddingModels, vectorDatabases } from "./utils"
import { useRagItem } from "./useRagItem"

interface Props {
    items: (typeof vectorDatabases[number] | typeof embeddingModels[number])[];
    defaultLayout: number[] | undefined
    onSearchChange: (query: string) => void
    activeTab: string;
    setActiveTab: (tab: string) => void
}

export function RAGLayout({
  items,
  defaultLayout = [265, 440, 655],
  onSearchChange,
  activeTab,
  setActiveTab
}: Props) {
    const [ragItem, setRagItem] = useRagItem()
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value)
    } 

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full max-h-[800px] items-stretch"
      >
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "vectorDatabase" | "embeddingModel")}>
            <div className="flex flex-col px-4 py-2">
              <h1 className="text-xl font-bold">RAG Settings</h1>
              <p className="text-sm font-bold mt-2">Configure your vector databases and embedding models for Retrieval-Augmented Generation.</p>
            </div>
            <Separator />
            <TabsList className="grid w-full grid-cols-2 mr-10">
              <TabsTrigger value="vectorDatabase">Vector Databases</TabsTrigger>
              <TabsTrigger value="embeddingModel">Embedding Models</TabsTrigger>
            </TabsList>
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" onChange={handleSearchChange} />
                </div>
              </form>
            </div>
            <RAGItemList 
              items={items} 
              type={activeTab} 
            />          
        </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <RAGItemDisplay
            item={items.find((item) => item.name === ragItem.selected)} 
            type={activeTab}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}