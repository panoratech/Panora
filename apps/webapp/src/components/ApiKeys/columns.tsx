"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ApiKey } from "./schema"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { TrashIcon } from "@radix-ui/react-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useDeleteApiKey from "@/hooks/delete/useDeleteApiKey"
import { useQueryClient } from "@tanstack/react-query"

// Create a proper React component for the actions cell
const DeleteApiKeyCell = ({ row }: { row: any }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { deleteApiKeyPromise } = useDeleteApiKey();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (confirmText.toLowerCase() === 'delete') {
      try {
        await toast.promise(
          deleteApiKeyPromise({
            id_api_key: row.original.id_api_key,
          }),
          {
            loading: 'Deleting API key...',
            success: 'API key deleted successfully',
            error: 'Failed to delete API key'
          }
        );
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        setDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete API key:', error);
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        onClick={() => setDialogOpen(true)}
      >
        <TrashIcon className="h-4 w-4 text-destructive" />
        <span className="sr-only">Delete API key</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm API Key Deletion</DialogTitle>
            <DialogDescription>
              This will permanently delete this API key. To confirm, please type &quot;delete&quot; below.
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
              onClick={handleDelete}
              disabled={confirmText.toLowerCase() !== 'delete'}
            >
              Delete API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function useColumns() {
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
      cell: ({ row }) => <DeleteApiKeyCell row={row} />,
    },
  ] as ColumnDef<ApiKey>[];
}
