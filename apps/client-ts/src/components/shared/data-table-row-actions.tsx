"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useDeleteApiKey from "@/hooks/delete/useDeleteApiKey"
import useDeleteWebhook from "@/hooks/delete/useDeleteWebhook"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  object: "webhook" | "api-key" | "field-mapping"
}

export function DataTableRowActions<TData>({
  row,
  object
}: DataTableRowActionsProps<TData>) {

  const {mutate: removeApiKey} = useDeleteApiKey();
  const {mutate: removeWebhook} = useDeleteWebhook();

  const handleDeletion = () => {
    switch(object) {
      case 'webhook':
        removeWebhook({
          id_webhook: (row.original as any).id_webhook_endpoint
        })
        break;
      case 'api-key':
        removeApiKey({
          id_api_key: (row.original as any).id_api_key
        })
        break;
      default:
        break;
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleDeletion}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}