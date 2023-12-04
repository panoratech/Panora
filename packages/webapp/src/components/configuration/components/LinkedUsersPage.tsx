import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {linked_users as LinkedUser} from "@api/exports";

export function LinkedUsersPage({
  linkedUsers
}: { linkedUsers: LinkedUser[] | undefined }) {

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
          <Badge variant="outline">{linkedUser.id_linked_user}</Badge>
        </p>
          <p className="text-sm text-left text-muted-foreground">
            {linkedUser.alias}
          </p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant={"outline"}>{linkedUser.linked_user_origin_id}</Badge>
        </div>
      </div>
      )
      })}
      
    </div>
  )
}