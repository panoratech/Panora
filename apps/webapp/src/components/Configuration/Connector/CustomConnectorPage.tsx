import * as React from "react"
import useVerticalStore from "@/state/verticalStore";
import { ConnectorLayout } from "./ConnectorLayout"
import { providersArray, Provider } from "@panora/shared"

export default function CustomConnectorPage() {
  const { vertical } = useVerticalStore();
  const [searchQuery, setSearchQuery] = React.useState("")
  const defaultLayout = undefined

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const filteredConnectors = vertical === "All"
    ? providersArray()
    : providersArray(vertical);

  const connectors = filteredConnectors.filter((connector: Provider) => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) || connector.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <>
      <div className="hidden flex-col md:flex">
        <ConnectorLayout
          connectors={connectors}
          defaultLayout={defaultLayout}
          onSearchChange={handleSearchChange}
        />
      </div>
    </>
  )
}
