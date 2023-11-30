"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, labels2, priorities, statuses } from "../../configuration/data/data"
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
      const label = labels2.find((label) => label.value === row.original.standard_object)

      return (
        <div className="w-[80px]">
          {label && <Badge variant="outline">{label.label}</Badge>}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.source_app)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
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
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
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
      const direction = priorities.find(
        (direction) => direction.value === row.getValue("category")
      )

      if (!direction) {
        return null
      }

      return (
        <div className="flex items-center">
          {direction.icon && (
            <direction.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{direction.label}</span>
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
      const status = statuses.find(
        (status) => status.value === row.getValue("source_field")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
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
      const label = labels.find((label) => label.value === row.original.destination_field)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("organisation")}
          </span>
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
      const label = labels.find((label) => label.value === row.original.data_type)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("date")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.date)

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("date")}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]