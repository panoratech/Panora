import * as React from "react"
import { RAGLayout } from "./RAGLayout";
import { embeddingModels, TabType, vectorDatabases } from "./utils";

export default function RAGSettingsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("vectorDatabase")
  const defaultLayout = undefined

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const items = activeTab === "vectorDatabase" ? vectorDatabases : embeddingModels
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }) 

  return (
    <div className="hidden flex-col md:flex">
      <RAGLayout 
        items={filteredItems}
        defaultLayout={defaultLayout}
        onSearchChange={handleSearchChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}