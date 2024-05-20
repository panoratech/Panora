import { DataTable } from "../../shared/data-table";
import { columns } from "./columns";


export function LinkedUsersPage({
  linkedUsers,
  isLoading
}: { linkedUsers: Record<string, any>[] | undefined; isLoading: boolean }) {

  const lusers = linkedUsers?.map(lu => ({
    linked_user_id: lu.id_linked_user,
    remote_user_id: lu.linked_user_origin_id,
  }))

  return (
    <>
    {linkedUsers && <DataTable data={lusers!} columns={columns} />}
    </>
  ) 
}