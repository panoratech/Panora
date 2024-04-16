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
import {getLogoURL,AuthStrategy} from '@panora/shared'
import useUpdateConnectionStrategyMutation from "@/hooks/mutations/useUpdateConnectionStrategy";
import useDeleteConnectionStrategyMutation from "@/hooks/mutations/useDeleteConnectionStrategy";

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
            <img className="w-4 h-4 rounded-lg mr-3" src={getLogoURL(row.original.provider_name.toLowerCase())} alt={row.original.provider_name}/>
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

      const Auth_Type = AuthStrategy.oauth2===row.getValue("auth_type") ? "OAuth2" : AuthStrategy.api_key===row.getValue("auth_type") ? "API Key" : "Basic Auth"

      return (
        <div className="flex space-x-2">
          <Badge variant="outline">{Auth_Type}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "vertical",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vertical" />
    ),
    cell: ({ row }) => {


      return (
        <div className="flex space-x-2">
          <Badge variant="outline">{row.getValue("vertical")}</Badge>
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

      const [isDisable,setDisable] = useState(false)

      const {mutate} = useUpdateConnectionStrategyMutation()



      const onSwitchChange = () => {
        setDisable(true)
        mutate(
          {
            id_cs:row.original.id_cs,
            ToUpdateToggle:true
          }, {
            onSuccess : () => setDisable(false),
            onError : () => setDisable(false)
          })
        // console.log("Changed switch")
      }




      return (
        <div className="flex w-[100px] items-center">
          {/* <Badge variant={row.getValue("activate")==false ? "destructive" : "primary"}>{row.getValue("activate")==false ? "Deactivated" : "Activated"}</Badge> */}
          <Switch onCheckedChange={() => onSwitchChange()} disabled={isDisable} value={row.getValue("status")}  defaultChecked={row.getValue("status")}/>
        </div>
      )
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
  // {
  //   // accessorFn: row => `${row}`,
  //   id:"id_cs",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Credentials" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center">

  //         {/* <RevealCredentialsCard  data={row.original}  /> */}

  //         <Badge variant="outline">Reveal Credentials</Badge>
  //         {/* <Link href={""} onClick={() => showData()} className={badgeVariants({ variant: "outline" })}>Reveal Credentials</Link> */}
  //         {/* <Button variant='outline'>Reveal Credentials</Button> */}
  //       </div>
  //     )
  //   },
  // },


  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {

      const [open,setOpen] = useState(false)

      const handleOpenChange = (open: boolean) => {
        setOpen(open)
        // form.reset()
      };

      const {mutate} = useDeleteConnectionStrategyMutation()

      const deleteConnectionStrategy = () => {
        mutate(
          {
            id_cs:row.original.id_cs
          }
        )
      }


      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
              
            <DropdownMenuItem onClick={() => deleteConnectionStrategy()}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:w-[450px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <AddAuthCredentialsForm data={row.original} closeDialog={() => setOpen(false)}  performUpdate={true} />
        </DialogContent>
        </Dialog>

      )
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
 
]