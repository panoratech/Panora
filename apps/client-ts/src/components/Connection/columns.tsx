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
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

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

const Customizer = ({
  logo,
  name,
  lastSync,
  authStrategy,
  linkedUserId,
  connectionToken,
}: {
  logo: string;
  name: string;
  lastSync: string;
  authStrategy: string;
  linkedUserId: string;
  connectionToken: string;
}) => {
  return (
    <div className="">
    <div className="flex items-start pt-4 md:pt-0">
      <div className="space-y-1 pr-2">
        <div className="flex space-x-2 items-center">
          <img src={logo} className="w-12 h-12 rounded-sm mr-2" />
          <div className="flex flex-col font-bold">
          {`${name.substring(0, 1).toUpperCase()}${name.substring(1)}`}
          <Badge variant={"outline"} className="rounded-xl py-1 font-normal">{authStrategy}</Badge>
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-1 mt-2 flex-col space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <Label className="text-xs">Last sync</Label>
        <Badge variant={"outline"} className="py-1 font-normal">{lastSync}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <Label className="text-xs">Connection Token</Label>
        <Badge variant={"outline"} className="py-1 font-normal">{truncateMiddle(connectionToken,6)}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <Label className="text-xs">Linked User Id</Label>
        <Badge variant={"outline"} className="py-1 font-normal">{truncateMiddle(linkedUserId,6)}</Badge>
      </div>
    </div>
    <div className="flex align-middle pt-2">
        <Button
          variant={"destructive"}
          size="sm"
          className="rounded-sm h-7 py-1 font-normal mr-2"
          onClick={() => { }}
        >
          Unconnect
        </Button>
        <Button
          size="sm"
          className="rounded-sm h-7 py-1 font-normal"
          onClick={() => { }}
        >
          Resync
        </Button>
    </div>
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
  },
  { 
    accessorKey: "status",
    header: ({ column }) => (
      ''
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
           <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="rounded-sm py-1 h-7 font-normal mr-1"><p className="pr-2">More Info</p> <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6788 2.95419C10.0435 2.53694 9.18829 2.54594 8.51194 3.00541C8.35757 3.11027 8.1921 3.27257 7.7651 3.69957L7.14638 4.31829C6.95112 4.51355 6.63454 4.51355 6.43928 4.31829C6.24401 4.12303 6.24401 3.80645 6.43928 3.61119L7.058 2.99247C7.0725 2.97797 7.08679 2.96366 7.1009 2.94955C7.47044 2.57991 7.70691 2.34336 7.95001 2.17822C8.94398 1.50299 10.2377 1.46813 11.2277 2.11832C11.4692 2.27689 11.7002 2.508 12.0515 2.85942C12.0662 2.8741 12.081 2.88898 12.0961 2.90408C12.1112 2.91917 12.1261 2.93405 12.1408 2.94871C12.4922 3.30001 12.7233 3.53102 12.8819 3.77248C13.5321 4.76252 13.4972 6.05623 12.822 7.0502C12.6568 7.2933 12.4203 7.52976 12.0507 7.89929C12.0366 7.9134 12.0222 7.92771 12.0077 7.94221L11.389 8.56093C11.1938 8.7562 10.8772 8.7562 10.6819 8.56093C10.4867 8.36567 10.4867 8.04909 10.6819 7.85383L11.3006 7.23511C11.7276 6.80811 11.8899 6.64264 11.9948 6.48827C12.4543 5.81192 12.4633 4.95675 12.046 4.32141C11.9513 4.17714 11.8009 4.02307 11.389 3.61119C10.9771 3.1993 10.8231 3.04893 10.6788 2.95419ZM4.31796 6.43961C4.51322 6.63487 4.51322 6.95146 4.31796 7.14672L3.69924 7.76544C3.27224 8.19244 3.10993 8.35791 3.00507 8.51227C2.54561 9.18863 2.53661 10.0438 2.95385 10.6791C3.0486 10.8234 3.19896 10.9775 3.61085 11.3894C4.02274 11.8012 4.17681 11.9516 4.32107 12.0464C4.95642 12.4636 5.81158 12.4546 6.48794 11.9951C6.6423 11.8903 6.80777 11.728 7.23477 11.301L7.85349 10.6823C8.04875 10.487 8.36533 10.487 8.5606 10.6823C8.75586 10.8775 8.75586 11.1941 8.5606 11.3894L7.94188 12.0081C7.92738 12.0226 7.91307 12.0369 7.89897 12.051C7.52943 12.4206 7.29296 12.6572 7.04986 12.8223C6.05589 13.4976 4.76219 13.5324 3.77214 12.8822C3.53068 12.7237 3.29967 12.4925 2.94837 12.1411C2.93371 12.1264 2.91883 12.1116 2.90374 12.0965C2.88865 12.0814 2.87377 12.0665 2.8591 12.0518C2.50766 11.7005 2.27656 11.4695 2.11799 11.2281C1.4678 10.238 1.50265 8.94432 2.17788 7.95035C2.34303 7.70724 2.57957 7.47077 2.94922 7.10124C2.96333 7.08713 2.97763 7.07283 2.99213 7.05833L3.61085 6.43961C3.80611 6.24435 4.12269 6.24435 4.31796 6.43961Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></Button>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              className="w-[340px] mr-40 mb-3 rounded-[0.5rem] bg-white p-6 dark:bg-zinc-950"
            >
            <Customizer 
              logo={getLogoURL((row.getValue("app") as string).toLowerCase())}
              name={(row.getValue("app") as string)}
              lastSync={"12/07/2024, 12:58:02 PM"}
              authStrategy={row.getValue("category")}
              linkedUserId={row.getValue("linkedUser")}
              connectionToken={row.getValue("connectionToken")}
            />
          </PopoverContent>
        </Popover>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }
];