import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton";
import {linked_users as LinkedUser} from "@api/exports";

export function LinkedUsersPage({
  linkedUsers,
  isLoading
}: { linkedUsers: LinkedUser[] | undefined; isLoading: boolean }) {

  return (
    <div className="space-y-8">
      {linkedUsers && linkedUsers.map((linkedUser: LinkedUser)=>{
        return (
        <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
        <p className="text-sm font-medium text-left leading-none">
          <Badge variant="outline">{isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : linkedUser.id_linked_user}</Badge>
        </p>
          <p className="text-sm text-left text-muted-foreground">
            {isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : linkedUser.alias}
          </p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant={"outline"}>{isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : linkedUser.linked_user_origin_id}</Badge>
        </div>
      </div>
      )
      })}
      
    </div>
  )
}