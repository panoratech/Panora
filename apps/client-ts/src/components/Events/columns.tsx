"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { Event } from "./schema"
import { getLogoURL } from "@panora/shared"
import { formatISODate } from "@/lib/utils"

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ row }) =>{ 
      return (
        <div className="w-[80px]">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("method")}</Badge>
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
      return (
        <div className="flex space-x-2">
         <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("url")}</Badge>       
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
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("status")}</Badge>     
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
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("direction")}</Badge>
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
      const provider = (row.getValue("integration") as string).toLowerCase();

      return (
        <div className="flex w-[100px] items-center">
            <Badge variant={"outline"} className="rounded-sm py-1 pr-2 font-normal">
              <img src={getLogoURL(provider)} className="w-5 h-5 rounded-sm mr-2" 
              />
              {provider}
            </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "id_linked_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id Linked User" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("id_linked_user")}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{formatISODate(row.getValue("date"))}</Badge>
        </div>
      )
    },
  }
]