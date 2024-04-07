"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from 'next/link';
import { Badge,badgeVariants } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {Pencil2Icon} from '@radix-ui/react-icons'
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { DataTableRowActions } from "../shared/data-table-row-actions"
import { Mapping } from "./data/authCredentialsSchema"
import { Button } from "@/components/ui/button"
import {Switch} from '@/components/ui/switch'
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import RevealCredentialsCard from "./RevealCredentialsCard";
import AddAuthCredentialsForm from "./AddAuthCredentialsForm";

export const authColumns: ColumnDef<Mapping>[] = [
  {
    // acc: 'provider_name',
    // accessorFn: row => `${row.provider_name} ${row.logoPath}`,
    accessorKey:'provider_name',
    // accessorKey: 'mergeD',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider Name" />
    ),
    cell: ({ row }) =>{ 


      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">
            <img className="w-4 h-4 rounded-lg mr-3" src={row.original.logoPath} alt={row.original.provider_name}/>
            {row.original.provider_name}
            </Badge>
        </div>
      )
    },
  
  },
  {
    accessorKey: "auth_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Authentication Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge variant="outline">{row.getValue("auth_type")}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "activate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {/* <Badge variant={row.getValue("activate")==false ? "destructive" : "primary"}>{row.getValue("activate")==false ? "Deactivated" : "Activated"}</Badge> */}
          <Switch  checked={row.getValue("activate")}/>
        </div>
      )
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
  {
    // accessorFn: row => `${row}`,
    id:"data",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Credentials" />
    ),
    cell: ({ row }) => {

      




      return (
        <div className="flex items-center">

          <RevealCredentialsCard auth_type={row.original.auth_type} authCredentials={row.original.credentials} />

          {/* <Badge variant="outline">Reveal Credentials</Badge> */}
          {/* <Link href={""} onClick={() => showData()} className={badgeVariants({ variant: "outline" })}>Reveal Credentials</Link> */}
          {/* <Button variant='outline'>Reveal Credentials</Button> */}
        </div>
      )
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>           
              <DialogTrigger asChild>
                <DropdownMenuItem>Edit</DropdownMenuItem>    
              </DialogTrigger>
              
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <AddAuthCredentialsForm data={row.original} />
        </DialogContent>
        </Dialog>

      )
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
 
]