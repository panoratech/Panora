"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ConnectorDisplay } from "./ConnectorDisplay"
import { ConnectorList } from "./ConnectorList"
import { VerticalSelector } from "./VerticalSelector"
import { Provider } from "@panora/shared"
import { useConnector } from "./useConnector"

interface Props {
  connectors: Provider[]
  defaultLayout: number[] | undefined
  onSearchChange: (query: string) => void
}

export function ConnectorLayout({
  connectors,
  defaultLayout = [265, 440, 655],
  onSearchChange
}: Props) {
  const [connector] = useConnector()
  const [selectedVertical, setSelectedVertical] = React.useState<string>("")
  
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
          <Tabs defaultValue="all">
            <div className="flex flex-col px-4 py-2">
              <h1 className="text-xl font-bold">Connectors</h1>
              <p className="text-sm font-bold mt-2">By default, all connectors use Panora managed credentials. You can edit settings to use your own credentials on this screen.</p>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative flex flex-row">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8 pr-2" onChange={handleSearchChange} />
                  <VerticalSelector onSelectVertical={setSelectedVertical} />
                </div>
              </form>
            </div>
            <ConnectorList items={connectors} />
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <ConnectorDisplay
            item={connectors.find((item) => `${item.vertical}-${item.name}` === connector.selected)}
          />
        </ResizablePanel>
        <ResizableHandle />
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
