"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { DataTableColumnHeader } from "../../shared/data-table-column-header"
import { DataTableRowActions } from "../../shared/data-table-row-actions"
import { Mapping } from "../data/schema"

export const columns: ColumnDef<Mapping>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "standard_object",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Standard Object" />
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
          <Badge variant="outline">{row.getValue("source_app")}</Badge>
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
      <DataTableColumnHeader column={column} title="Source Field" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">{row.getValue("source_field")}</Badge>
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
      <DataTableColumnHeader column={column} title="Destination Field" />
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]