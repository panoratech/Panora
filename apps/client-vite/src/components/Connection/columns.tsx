"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { Connection } from "./data/schema"
import { DataTableColumnHeader } from "./../shared/data-table-column-header"

function truncateMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }

  const start = str.substring(0, maxLength / 2);
  const end = str.substring(str.length - maxLength / 2);
  return `${start}...${end}`;
}

function insertDots(originalString: string): string {
  if(!originalString) return "";
  if (originalString.length <= 50) {
    return originalString;
  }
  return originalString.substring(0, 50 - 3) + '...';
}

export const columns: ColumnDef<Connection>[] = [
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
    accessorKey: "organisation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organisation" />
    ),
    cell: ({ row }) => <div className="w-[80px]"><Badge variant="outline">{row.getValue("organisation") as string}</Badge></div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "app", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App" />
    ),
    cell: ({ row }) => {      
      const provider = (row.getValue("app") as string).toLowerCase();
      return (
        <div className="flex space-x-2">
          <Badge variant={"outline"} className="p-1 pr-2">
              <img src={
                provider == "hubspot" ?
                `providers/crm/${provider}.jpg` : 
                provider == "zoho" ? 
                `providers/crm/${provider}.webp`
                : `providers/crm/${provider}.png`
                } className="w-5 h-5 rounded-sm mr-2" 
              />
              {provider}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {/*status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )*/}
          <Badge variant="outline">{row.getValue("category")}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  { 
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      /*const direction = priorities.find(
        (direction) => direction.value === row.getValue("status")
      )

      if (!direction) {
        return null
      }*/

      return (
        <div className="flex items-center">
          <Badge variant="outline">{row.getValue("status")}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "linkedUser",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Linked User" />
    ),
    cell: ({ row }) => {
      /*const status = statuses.find(
        (status) => status.value === row.getValue("linkedUser")
      )

      if (!status) {
        return null
      }*/

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">{truncateMiddle(row.getValue("linkedUser"), 10)}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      //const label = labels.find((label) => label.value === row.original.date)

      return (
        <div className="flex space-x-2">
          <Badge variant="outline">{row.getValue("date")}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "connectionToken",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Connection Token" />
    ),
    cell: ({ row }) => {
      <div className="flex">
        <div className=" truncate mr-2">
          <Badge variant="outline">{insertDots(row.getValue("connectionToken"))}</Badge>
        </div>
        <div 
          className="h-5 w-5 cursor-pointer mt-1" 
          onClick={() => navigator.clipboard.writeText(row.getValue("connectionToken"))}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6788 2.95419C10.0435 2.53694 9.18829 2.54594 8.51194 3.00541C8.35757 3.11027 8.1921 3.27257 7.7651 3.69957L7.14638 4.31829C6.95112 4.51355 6.63454 4.51355 6.43928 4.31829C6.24401 4.12303 6.24401 3.80645 6.43928 3.61119L7.058 2.99247C7.0725 2.97797 7.08679 2.96366 7.1009 2.94955C7.47044 2.57991 7.70691 2.34336 7.95001 2.17822C8.94398 1.50299 10.2377 1.46813 11.2277 2.11832C11.4692 2.27689 11.7002 2.508 12.0515 2.85942C12.0662 2.8741 12.081 2.88898 12.0961 2.90408C12.1112 2.91917 12.1261 2.93405 12.1408 2.94871C12.4922 3.30001 12.7233 3.53102 12.8819 3.77248C13.5321 4.76252 13.4972 6.05623 12.822 7.0502C12.6568 7.2933 12.4203 7.52976 12.0507 7.89929C12.0366 7.9134 12.0222 7.92771 12.0077 7.94221L11.389 8.56093C11.1938 8.7562 10.8772 8.7562 10.6819 8.56093C10.4867 8.36567 10.4867 8.04909 10.6819 7.85383L11.3006 7.23511C11.7276 6.80811 11.8899 6.64264 11.9948 6.48827C12.4543 5.81192 12.4633 4.95675 12.046 4.32141C11.9513 4.17714 11.8009 4.02307 11.389 3.61119C10.9771 3.1993 10.8231 3.04893 10.6788 2.95419ZM4.31796 6.43961C4.51322 6.63487 4.51322 6.95146 4.31796 7.14672L3.69924 7.76544C3.27224 8.19244 3.10993 8.35791 3.00507 8.51227C2.54561 9.18863 2.53661 10.0438 2.95385 10.6791C3.0486 10.8234 3.19896 10.9775 3.61085 11.3894C4.02274 11.8012 4.17681 11.9516 4.32107 12.0464C4.95642 12.4636 5.81158 12.4546 6.48794 11.9951C6.6423 11.8903 6.80777 11.728 7.23477 11.301L7.85349 10.6823C8.04875 10.487 8.36533 10.487 8.5606 10.6823C8.75586 10.8775 8.75586 11.1941 8.5606 11.3894L7.94188 12.0081C7.92738 12.0226 7.91307 12.0369 7.89897 12.051C7.52943 12.4206 7.29296 12.6572 7.04986 12.8223C6.05589 13.4976 4.76219 13.5324 3.77214 12.8822C3.53068 12.7237 3.29967 12.4925 2.94837 12.1411C2.93371 12.1264 2.91883 12.1116 2.90374 12.0965C2.88865 12.0814 2.87377 12.0665 2.8591 12.0518C2.50766 11.7005 2.27656 11.4695 2.11799 11.2281C1.4678 10.238 1.50265 8.94432 2.17788 7.95035C2.34303 7.70724 2.57957 7.47077 2.94922 7.10124C2.96333 7.08713 2.97763 7.07283 2.99213 7.05833L3.61085 6.43961C3.80611 6.24435 4.12269 6.24435 4.31796 6.43961Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </div>
      </div>
    },
  }
]