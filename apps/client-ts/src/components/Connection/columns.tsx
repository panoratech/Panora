"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Connection } from "./schema"
import { DataTableColumnHeader } from "./../shared/data-table-column-header"
import React from "react"
import { ClipboardIcon } from '@radix-ui/react-icons'
import { toast } from "sonner"
import { getLogoURL } from "@panora/shared"
import { formatISODate, truncateMiddle } from "@/lib/utils"
import { Button } from "../ui/button"

const connectionTokenComponent = ({row}:{row:any}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(row.getValue("connectionToken"));
      toast.success("Connection token copied", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      })
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex items-center">
        <Badge variant="outline" className="rounded-sm py-1 font-normal">{truncateMiddle(row.getValue("connectionToken"),6)}   
        <ClipboardIcon onClick={handleCopy} className=""/>
        </Badge>
    </div>
  )
}

export const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "app", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App" />
    ),
    cell: ({ row }) => {      
      const provider = (row.getValue("app") as string).toLowerCase();
      return (
        <div className="flex space-x-2">
          <Badge variant={"outline"} className="rounded-sm pr-6 py-1 font-normal">
              <img src={getLogoURL(provider)} className="w-5 h-5 rounded-sm mr-2" 
          />
              {provider}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {/*status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )*/}
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("category")}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "vertical",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vertical" />
    ),
    cell: ({ row }) => <div className="w-[80px]"><Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("vertical") as string}</Badge></div>,
    enableSorting: false,
    enableHiding: false,
  },
  { 
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      /*const direction = priorities.find(
        (direction) => direction.value === row.getValue("status")
      )

      if (!direction) {
        return null
      }*/

      return (
        <div className="flex items-center">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("status")}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "linkedUser",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Linked User" />
    ),
    cell: ({ row }) => {
      /*const status = statuses.find(
        (status) => status.value === row.getValue("linkedUser")
      )

      if (!status) {
        return null
      }*/

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{truncateMiddle(row.getValue("linkedUser"), 10)}</Badge>
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
      //const label = labels.find((label) => label.value === row.original.date)

      return (
        <div className="flex">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{formatISODate(row.getValue("date"))}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "connectionToken",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Connection Token" />
    ),
    cell: connectionTokenComponent
  }
]