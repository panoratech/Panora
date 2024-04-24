import { DataTable } from "@/components/shared/data-table";
import { authColumns } from "./authColumns";
import {AuthStrategy} from '@panora/shared'
import { DataTableLoading } from "@/components/shared/data-table-loading";
import { Suspense } from "react";

export interface authCredentialsMapping {
  id_cs : string,
  provider_name : string,
  auth_type: AuthStrategy,
  vertical: string,
  type: string,
  status: boolean,
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
        <Suspense>
        {mappings && <DataTable data={mappings} columns={authColumns} filterColumn="provider_name"  />}
        </Suspense>
      </div>
    </>
  )
}