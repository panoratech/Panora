"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { DataTableColumnHeader } from "../../shared/data-table-column-header"
import { DataTableRowActions } from "../../shared/data-table-row-actions"
import { Job } from "../data/schema"

export const columns: ColumnDef<Job>[] = [
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
    accessorKey: "method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ row }) =>{ 
      //const label = labels2.find((label) => label.value === row.original.method)

      return (
        <div className="w-[80px]">
          {row.getValue("method") ? <Badge variant="outline">{row.getValue("method")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "url",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" />
    ),
    cell: ({ row }) => {
      //const label = labels.find((label) => label.value === row.original.url)

      return (
        <div className="flex space-x-2">
          {row.getValue("url") ? <Badge variant="outline">{row.getValue("url")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }        
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
      /*const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }*/

      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("status") ? <Badge variant="outline">{row.getValue("status")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }        
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "direction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Direction" />
    ),
    cell: ({ row }) => {
      /*const direction = priorities.find(
        (direction) => direction.value === row.getValue("direction")
      )

      if (!direction) {
        return null
      }*/

      return (
        <div className="flex items-center">
          {row.getValue("direction") ? <Badge variant="outline">{row.getValue("direction")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "integration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Integration" />
    ),
    cell: ({ row }) => {
      /*const status = statuses.find(
        (status) => status.value === row.getValue("integration")
      )

      if (!status) {
        return null
      }*/

      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("integration") ? <Badge variant="outline">{row.getValue("integration")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "organisation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organisation" />
    ),
    cell: ({ row }) => {
      //const label = labels.find((label) => label.value === row.original.organisation)

      return (
        <div className="flex space-x-2">
          {row.getValue("organisation") ? <Badge variant="outline">{row.getValue("organisation")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }
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
      //const label = labels.find((label) => label.value === row.original.date)

      return (
        <div className="flex space-x-2">
          {row.getValue("date") ? <Badge variant="outline">{row.getValue("date")}</Badge>
          : <Badge variant="secondary">_null_</Badge>
          }
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]