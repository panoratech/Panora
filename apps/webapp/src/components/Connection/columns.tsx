"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Connection } from "./schema"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import React, { useState } from "react"
import { ClipboardIcon, DotsHorizontalIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import { toast } from "sonner"
import { getLogoURL } from "@panora/shared"
import { formatISODate, truncateMiddle } from "@/lib/utils"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useResync from "@/hooks/create/useResync"
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

  const getFirstUUIDPart = (uuid: string) => {
    return uuid.split('-')[0];
  };

  return (
    <div className="flex items-center">
        <Badge 
          variant="outline" 
          className="rounded-sm py-1 font-normal cursor-pointer hover:bg-accent"
          onClick={handleCopy}
        >
          {getFirstUUIDPart(row.getValue("connectionToken"))}
        </Badge>
    </div>
  )
}

const linkedUserComponent = ({row}:{row:any}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(row.getValue("linkedUser"));
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
          {row.getValue("linkedUser").substring(0, 6)}
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
    <div className="flex">
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

const Customizer = ({
  logo,
  name,
  vertical,
  lastSync,
  authStrategy,
  linkedUserId,
  connectionToken,
}: {
  logo: string;
  name: string;
  vertical: string;
  lastSync: string;
  authStrategy: string;
  linkedUserId: string;
  connectionToken: string;
}) => {

  const { resyncPromise } = useResync();

  const getFirstUUIDPart = (uuid: string) => {
    return uuid.split('-')[0];
  };

  const handleCopyLinkedUser = async () => {
    try {
      await navigator.clipboard.writeText(linkedUserId);
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

  const handleResync = async (vertical: string, name: string, linkedUserId: string) => {
    try {
      toast.promise(
        resyncPromise({
          vertical,
          provider: name,
          linkedUserId
        }),
        {
        loading: 'Loading...',
        success: (data: any) => {
          return (
            <div className="flex flex-row items-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
              <div className="ml-2">
                Resync for {vertical}:{name} initiated
              </div>
            </div>
          )
          ;
        },
        error: (err: any) => err.message || 'Error'
      });
  
     /*posthog?.capture("resync_init", {
        id_project: idProject,
        mode: config.DISTRIBUTION
      })*/
    } catch (err) {
      console.error('Failed to resync: ', err);
    }
  }; 

  return (
    <div className="">
    <div className="flex items-start pt-4 md:pt-0">
      <div className="space-y-1 pr-2">
        <div className="flex space-x-2 items-center">
          <Image 
            src={logo} 
            width={48} 
            height={48} 
            className="rounded-sm mr-2"
            alt={`${name} logo`}
          />
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
        <Badge 
          variant={"outline"} 
          className="py-1 font-normal cursor-pointer hover:bg-accent"
          onClick={() => {
            navigator.clipboard.writeText(connectionToken);
            toast.success("Connection token copied");
          }}
        >
          {getFirstUUIDPart(connectionToken)}
        </Badge>
      </div>
      <div className="flex justify-between items-center">
        <Label className="text-xs">Linked User Id</Label>
        <Badge 
          variant={"outline"} 
          className="py-1 font-normal cursor-pointer hover:bg-accent"
          onClick={() => {
            navigator.clipboard.writeText(linkedUserId);
            toast.success("Linked User ID copied");
          }}
        >
          {linkedUserId.substring(0, 6)}
        </Badge>
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
          onClick={() => handleResync(vertical, name, linkedUserId)} 
        > 
          Resync
        </Button>
    </div>
  </div>
  
  )
}

const ConnectionActionsCell = ({ row }: { row: any }) => {
  const { resyncPromise } = useResync();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleResync = async () => {
    try {
      toast.promise(
        resyncPromise({
          vertical: row.getValue("vertical"),
          provider: row.getValue("app"),
          linkedUserId: row.getValue("linkedUser")
        }),
        {
          loading: 'Syncing...',
          success: 'Sync initiated successfully',
          error: 'Failed to sync'
        }
      );
    } catch (error) {
      console.error('Failed to resync:', error);
    }
  };

  const handleDisconnectClick = () => {
    setConfirmText('');
    setDialogOpen(true);
  };

  const handleConfirmDisconnect = () => {
    if (confirmText.toLowerCase() === 'delete') {
      // TODO: Implement disconnect logic here
      toast.success('Connection deleted successfully');
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Connection Deletion</DialogTitle>
            <DialogDescription>
              This will permanently delete the integration for {row.getValue("app")}. To confirm, please type &quot;delete&quot; below.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDisconnect}
              disabled={confirmText.toLowerCase() !== 'delete'}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleResync}>
            <ReloadIcon className="mr-2 h-4 w-4" />
            <span>Resync</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={handleDisconnectClick}>
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "app",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
    cell: ({ row }) => {
      const provider = (row.getValue("app") as string).toLowerCase();

      return (
        <div className="flex w-[100px] items-center">
            <Badge variant="outline" className="rounded-sm py-1 pr-2 font-normal">
              <img src={getLogoURL(provider)} className="w-5 h-5 rounded-sm mr-2" alt={`${provider} logo`} />
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
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auth" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
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
    cell: linkedUserComponent,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: dateComponent,
  },
  { 
    accessorKey: "status",
    header: ({ column }) => (
      ''
    ),
    cell: ({ row }) => <ConnectionActionsCell row={row} />
  }
];