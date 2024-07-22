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
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useQueryClient } from "@tanstack/react-query"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  object: "webhook" | "api-key" | "field-mapping"
}

export function DataTableRowActions<TData>({
  row,
  object
}: DataTableRowActionsProps<TData>) {

  const {deleteApiKeyPromise} = useDeleteApiKey();
  const {deleteWebhookPromise} = useDeleteWebhook();
  
  const queryClient = useQueryClient();

  const handleDeletion = () => {
    switch(object) {
      case 'webhook':
        toast.promise(
          deleteWebhookPromise({
            id_webhook: (row.original as any).id_webhook_endpoint
          }), 
          {
          loading: 'Loading...',
          success: (data: any) => {
            queryClient.setQueryData<any[]>(['webhooks'], (oldQueryData = []) => {
              return oldQueryData.filter((wh) => wh.id_webhook_endpoint !== data.id_webhook_endpoint);
            });
            return (
              <div className="flex flex-row items-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <div className="ml-2">
                  Webhook
                  <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.url}`}</Badge>
                  has been deleted
                </div>
              </div>
            )
            ;
          },
          error: (err: any) => err.message || 'Error'
        });
        break;
      case 'api-key':
        toast.promise(
          deleteApiKeyPromise({
            id_api_key: (row.original as any).id_api_key
          }), 
          {
          loading: 'Loading...',
          success: (data: any) => {
            queryClient.setQueryData<any[]>(['api-keys'], (oldQueryData = []) => {
              return oldQueryData.filter((api_key) => api_key.id_api_key !== data.id_api_key);
            });
            return (
              <div className="flex flex-row items-center">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <div className="ml-2">
                  Api key
                  <Badge variant="secondary" className="rounded-sm px-1 mx-2 font-normal">{`${data.name}`}</Badge>
                  has been deleted
                </div>
              </div>
            )
            ;
          },
          error: (err: any) => err.message || 'Error'
        });
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