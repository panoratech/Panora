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
import useProfileStore from "@/state/profileStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from 'js-cookie';
import useProjectStore from "@/state/projectStore"
import { useQueryClient } from '@tanstack/react-query';

export function UserNav() {
  const router = useRouter();
  const { profile, setProfile } = useProfileStore();
  const { setIdProject } = useProjectStore();
  const queryClient = useQueryClient();

  const onLogout = () => {
    router.push('/b2c/login')
    Cookies.remove("access_token")
    setProfile(null)
    setIdProject("")
    queryClient.clear()
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