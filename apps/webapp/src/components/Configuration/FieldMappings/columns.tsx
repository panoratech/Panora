"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "../../shared/data-table-column-header"
import { DataTableRowActions } from "../../shared/data-table-row-actions"
import { Mapping } from "./schema"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MapForm } from "./mapForm"

export function useColumns() {
  const [mapOpen, setMapOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Mapping | null>(null);

  const handleMapClick = (row: Mapping) => {
    setCurrentRow(row);
    setMapOpen(true);
  };

  const handleClose = () => {
    setMapOpen(false);
    setCurrentRow(null);
  };

  return [
    {
      accessorKey: "_",
      cell: ({ row }) => (
        !row.getValue("source_app") && !row.getValue("source_field") && <>
          <Button
            size="sm"
            className="h-7 gap-1"
            onClick={() => handleMapClick(row.original)}
          >
            Map Field
          </Button>
          <Dialog open={mapOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
              {currentRow && <MapForm onClose={handleClose} fieldToMap={row.getValue("destination_field") as string} />}
            </DialogContent>
          </Dialog>
        </>
      ),
    },
    {
      accessorKey: "standard_object",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unified Model" />
      ),
      cell: ({ row }) =>{ 
  
        return (
          <div className="w-[80px]">
            <Badge variant="outline">{row.getValue("standard_object")}</Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "source_app",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Provider" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            {(row.getValue("source_app") as string) && <Badge variant="outline">{row.getValue("source_app")}</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[100px] items-center">
            <Badge variant="outline">{row.getValue("status")}</Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Badge variant="outline">{row.getValue("category")}</Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "source_field",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source Field Identifier" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[100px] items-center">
            {(row.getValue("source_field") as string) && <Badge variant="outline">{row.getValue("source_field")}</Badge>}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "destination_field",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Panora Field Identifier" />
      ),
      cell: ({ row }) => {
  
        return (
          <div className="flex space-x-2">
            <Badge variant="outline">{row.getValue("destination_field")}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "data_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data Type" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Badge variant="outline">{row.getValue("data_type")}</Badge>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} object={"field-mapping"} />,
    },
  ] as ColumnDef<Mapping>[];
}