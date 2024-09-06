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
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} object={"api-key"}/>,
    },
  ] as ColumnDef<ApiKey>[];
}
