"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ApiKey } from "./schema"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { DataTableRowActions } from "../shared/data-table-row-actions"
import { PasswordInput } from "../ui/password-input"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Card } from "antd"

export function useColumns() {
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedState((prevState) => ({
      ...prevState,
      [token]: true,
    }));
    toast.success("Api key copied", {
      action: {
        label: "Close",
        onClick: () => console.log("Close"),
      },
    })
    setTimeout(() => {
      setCopiedState((prevState) => ({
        ...prevState,
        [token]: false,
      }));
    }, 2000); // Reset copied state after 2 seconds
  };

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div><Badge variant="outline">{row.getValue("name")}</Badge></div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "token",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Token" />
      ),
      cell: ({ row }) => {
        const token: string = row.getValue("token");
        const copied = copiedState[token] || false;
        
        return (
          <div className="flex items-center">
            <div className="truncate mr-2">
              <PasswordInput value={token} readOnly className="rounded-xl" />
            </div>
            <div 
              className="cursor-pointer" 
              onClick={() => handleCopy(token)}
            >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline">{copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="#ffffff">
                          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                        </svg>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        </>
                      )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Copy Key</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
              
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} object={"api-key"}/>,
    },
  ] as ColumnDef<ApiKey>[];
}
