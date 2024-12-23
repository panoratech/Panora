"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { Event } from "./schema"
import { getLogoURL } from "@panora/shared"
import { formatISODate } from "@/lib/utils"
import { toast } from "sonner"
import Image from 'next/image';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If date is today
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If date is within this year
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  
  // If date is from previous years
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const linkedUserComponent = ({row}:{row:any}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(row.getValue("id_linked_user"));
      toast.success("Linked User ID copied", {
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
        <Badge 
          variant="outline" 
          className="rounded-sm py-1 font-normal cursor-pointer hover:bg-accent"
          onClick={handleCopy}
        >
          {row.getValue("id_linked_user").substring(0, 6)}
        </Badge>
    </div>
  )
}

const dateComponent = ({row}:{row:any}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(row.getValue("date"));
      toast.success("Timestamp copied", {
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
    <div className="flex space-x-2">
      <Badge 
        variant="outline" 
        className="rounded-sm py-1 font-normal cursor-pointer hover:bg-accent"
        onClick={handleCopy}
      >
        {formatDate(row.getValue("date"))}
      </Badge>
    </div>
  )
}

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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="rounded-sm py-1 font-normal">{row.getValue("type")}</Badge>
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
            <Badge variant="outline" className="rounded-sm py-1 pr-2 font-normal">
              <img src={getLogoURL(provider)} className="w-5 h-5 rounded-sm mr-2" />
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
    cell: linkedUserComponent,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: dateComponent,
  }
]