import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
  
  export function RecentSales() {
    return (
      <div className="space-y-8">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
          <p className="text-sm font-medium text-left leading-none">user-origin-id-9c89</p>
            <p className="text-sm text-left text-muted-foreground">
              @ACME.ORG
            </p>
          </div>
          <div className="ml-auto font-medium">
          <Badge variant={"outline"}>6dda265c-4bb7-4919-9c89-3b178069d0d1</Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/02.png" alt="Avatar" />
            <AvatarFallback>CP</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
          <p className="text-sm font-medium text-left leading-none">user-origin-id-9c89</p>
            <p className="text-sm text-left text-muted-foreground">
              @ACME.ORG
            </p>
          </div>
          <div className="ml-auto font-medium">
          <Badge variant={"outline"}>6dda265c-4bb7-4919-9c89-3b178069d0d1</Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="Avatar" />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
          <p className="text-sm font-medium text-left leading-none">user-origin-id-9c89</p>
            <p className="text-sm text-left text-muted-foreground">
              @ACME.ORG
            </p>
          </div>
          <div className="ml-auto font-medium">
          <Badge variant={"outline"}>6dda265c-4bb7-4919-9c89-3b178069d0d1</Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/04.png" alt="Avatar" />
            <AvatarFallback>IN</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
          <p className="text-sm font-medium text-left leading-none">user-origin-id-9c89</p>
            <p className="text-sm text-left text-muted-foreground">
              @ACME.ORG
            </p>
          </div>
          <div className="ml-auto font-medium">
          <Badge variant={"outline"}>6dda265c-4bb7-4919-9c89-3b178069d0d1</Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/05.png" alt="Avatar" />
            <AvatarFallback>HG</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium text-left leading-none">user-origin-id-9c89</p>
            <p className="text-sm text-left text-muted-foreground">
              @ACME.ORG
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Badge variant={"outline"}>6dda265c-4bb7-4919-9c89-3b178069d0d1</Badge>
          </div>
        </div>
  
      </div>
    )
  }