/* eslint-disable react/jsx-key */
'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { PasswordInput } from "@/components/ui/password-input"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DataTableRowActions } from "@/components/shared/data-table-row-actions"
import { Switch } from "@/components/ui/switch"
import useUpdateWebhookStatus from "@/hooks/update/useUpdateWebhookStatus"
import { Webhook } from "./WebhooksPage"


export function useColumns(webhooks: Webhook[] | undefined, setWebhooks: React.Dispatch<React.SetStateAction<Webhook[] | undefined>>) {
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});
  const { mutate } = useUpdateWebhookStatus();

  const disableWebhook = (webhook_id: string, status: boolean) => {
    mutate({ 
      id: webhook_id,
      active: status,
    }, {
      onSuccess: () => {
        const index = webhooks!.findIndex(webhook => webhook.id_webhook_endpoint === webhook_id);
        if (index !== -1) { 
          const updatedWebhooks = [...webhooks!];
          updatedWebhooks[index].active = status;
          setWebhooks(updatedWebhooks);
        }
      }
    });
  }

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedState((prevState) => ({
      ...prevState,
      [token]: true,
    }));
    setTimeout(() => {
      setCopiedState((prevState) => ({
        ...prevState,
        [token]: false,
      }));
    }, 2000); // Reset copied state after 2 seconds
  };

  return [
    {
      accessorKey: "url",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Endpoint" />
      ),
      cell: ({ row }) => 
        <Badge
          variant="outline"
          key={row.getValue("url")}
          className="rounded-lg p-1 m-1 font-bold"
        >
          {row.getValue("url")}
        </Badge>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "secret",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Secret" />
      ),
      cell: ({ row }) => {
        const token: string = row.getValue("secret");
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
                    <p className="text-sm">Copy Secret</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "endpoint_description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => 
        <Badge
        variant="outline"
        key={row.getValue("endpoint_description")}
        className="rounded-lg p-1 m-1 font-normal"
      >
        {row.getValue("endpoint_description")}
      </Badge>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "scope",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scopes" />
      ),
      cell: ({ row }) => <div>
        {(row.getValue("scope") as string[]).map((scope) => {
          return (<Badge
            variant="secondary"
            key={scope}
            className="rounded-sm px-1 m-1 font-normal"
          >
            {scope}
          </Badge>)
        })}
        </div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <div>
        <Switch 
          className="data-[state=checked]:bg-sky-700"
          id="necessary" 
          checked={row.getValue('active')}
          onCheckedChange={() => disableWebhook(row.original.id_webhook_endpoint, !row.getValue('active')) }
        />
      </div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} object={"webhook"} />,
    },
  ] as ColumnDef<Webhook>[];
}
