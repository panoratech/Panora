import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { DataTable } from "@/components/shared/data-table";
import { columns } from "./columns";
import { DataTableLoading } from "@/components/shared/data-table-loading";

export interface Mapping {
  standard_object: string; 
  source_app: string; 
  status: string;  
  category: string; 
  source_field: string;
  destination_field: string;
  data_type: string;
}

export default function FieldMappingsTable({
  mappings,
  isLoading
}: { mappings: Mapping[] | undefined; isLoading: boolean }) {

  const countDefined = mappings?.filter(mapping => mapping.status === "defined").length;
  const countMapped = mappings?.filter(mapping => mapping.status === "mapped").length;

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center space-x-4 justify-between flex-row">
        <Card className="w-1/2">
            <CardHeader>
                <CardTitle>Defined</CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-4xl font-bold">{countDefined}</p>
            </CardContent>

        </Card>
        <Card className="w-1/2">
            <CardHeader>
                <CardTitle>Mapped</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{countMapped}</p>
            </CardContent>
        </Card>                  
        </div>
        {isLoading && <DataTableLoading data={[]} columns={columns}/>}
        {mappings && <DataTable data={mappings} columns={columns} />}
      </div>
    </>
  )
}