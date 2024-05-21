import { ColumnDef } from "@tanstack/react-table";
import { ColumnLU } from "./schema";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<ColumnLU>[] = [
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