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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import Cookies from 'js-cookie';
import useProjectStore from "@/state/projectStore"
import { useQueryClient } from '@tanstack/react-query';

  
export function UserNav() {
  // const stytch = useStytch();
  // const { user } = useStytchUser();
  const router = useRouter();
  //const {data, isLoading, isError, error} = useProfile(user?.user_id!);
  const { profile, setProfile } = useProfileStore();
  const { idProject, setIdProject } = useProjectStore();
  const queryClient = useQueryClient();



  /*useEffect(()=> {
    if(data){
      console.log("data is "+ JSON.stringify(data));
      setProfile({
        id_user: data.id_user,
        email: data.email!,
        first_name: data.first_name,
        last_name: data.last_name,
        //id_organization: data.id_organization as string,
      })
    }
  }, [data, setProfile]);*/

  const onLogout = () => {
    Cookies.remove("access_token")
    setProfile(null)
    setIdProject("")
    queryClient.clear()
    router.push('/b2c/login')

  }
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
            {profile ? profile.email || profile.first_name : "No profile found"}
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
            <DropdownMenuItem onClick={() => onLogout()} >
            Log out
            </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}