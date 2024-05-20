import { ColumnDef } from "@tanstack/react-table";
import { ColumnLU } from "./schema";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<ColumnLU>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "linked_user_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Linked User Id" />
      ),
      cell: ({ row }) =>{ 
        return (
          <div className="">
            <Badge variant="outline">{row.getValue("linked_user_id")}</Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "remote_user_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Remote User Id" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Badge variant="outline">{row.getValue("remote_user_id")}</Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  
  ]