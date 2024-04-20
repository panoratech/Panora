import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton";
import useProfile from "@/hooks/useProfile";
import useProfileStore from "@/state/profileStore";
import { useStytchUser } from "@stytch/nextjs";
import Link from "next/link";
import { useEffect } from "react";
  
export function UserNav() {
  const { user } = useStytchUser();
  const {data, isLoading} = useProfile(user?.user_id!);
  if(!data) {
    console.log("loading profiles");
  }
  const { profile, setProfile } = useProfileStore();

  useEffect(()=> {
    if(data && data.length > 0 ){
      setProfile({
        id_user: data[0].id_user,
        email: data[0].email!,
        first_name: data[0].first_name,
        last_name: data[0].last_name,
        //id_organization: data[0].id_organization as string,
      })
    }
  }, [data, setProfile]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 ml-10" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
            {profile ? profile.first_name || profile.email : isLoading ? <Skeleton className="w-[100px] h-[20px] rounded-md" /> : "No mail found"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href={"/b2c/profile"}>
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
          </Link>
          {/*<DropdownMenuItem>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
      </DropdownMenuItem>*/}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={"/api/logout"}>
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}