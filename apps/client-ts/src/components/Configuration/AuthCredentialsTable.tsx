import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { DataTable } from "@/components/shared/data-table";
import { authColumns } from "./authColumns";
import { DataTableLoading } from "@/components/shared/data-table-loading";

export interface authCredentialsMapping {
  provider_name: string; 
  auth_type: string; 
  activate: boolean;  
  credentials: object; 
  action: string;
  logoPath:string;
}

export default function AuthCredentialsTable({
  mappings,
  isLoading
}: { mappings: authCredentialsMapping[] | undefined; isLoading: boolean }) {

  // const countDefined = mappings?.filter(mapping => mapping.status === "defined").length;
  // const countMapped = mappings?.filter(mapping => mapping.status === "mapped").length;
  if(isLoading){
    return <DataTableLoading data={[]} columns={authColumns}/>;
  }
  return (
    <>
      <div className="hidden h-full flex-1 flex-col md:flex">
      {/* <div className="flex items-center space-x-4 justify-between flex-row"> */}
        {/* <Card className="w-1/2">
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
        </Card>                   */}
        {/* </div> */}
        {mappings && <DataTable data={mappings} columns={authColumns} filterColumn="provider_name"  />}
      </div>
    </>
  )
}