import { ColumnDef } from "@tanstack/react-table";
import { ColumnLU } from "./schema";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";


const LinkedUserIdComponent = ({ row } : {row:any}) => { 

  const handleCopyLinkedUserId = () => {
    navigator.clipboard.writeText(row.getValue("linked_user_id"));
    toast.success("LinkedUser ID copied!", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      })
  };

  return (
        <div className="cursor-pointer" onClick={handleCopyLinkedUserId}>
        <TooltipProvider delayDuration={0}>
            <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" >
                {row.getValue("linked_user_id")}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-sm">Copy</p>
            </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        </div>
  )
}


export const columns: ColumnDef<ColumnLU>[] = [
    {
      accessorKey: "linked_user_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Linked User Id" />
      ),
      cell: LinkedUserIdComponent,
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