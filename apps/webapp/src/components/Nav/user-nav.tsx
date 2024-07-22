import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useProfileStore from "@/state/profileStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from 'js-cookie';
import useProjectStore from "@/state/projectStore";
import { useQueryClient } from '@tanstack/react-query';
import {User,LogOut,SunMoon,Sun,Moon,Monitor} from 'lucide-react';
import {DotsHorizontalIcon} from '@radix-ui/react-icons';
import { useTheme } from "next-themes";


export function UserNav() {
  const router = useRouter();
  const { profile, setProfile } = useProfileStore();
  const { setIdProject } = useProjectStore();
  const queryClient = useQueryClient();
  const { setTheme,theme } = useTheme();
  // const [currentTheme,SetCurrentTheme] = useState(theme)

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
        {/* <Button variant="ghost" className="relative h-8 w-8 rounded-full"> */}
          <div className="flex p-3 hover:bg-accent items-center gap-4">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <p className="text-sm">
          {profile ? `${profile.first_name} ${profile.last_name}` : ""}
          </p>
          <DotsHorizontalIcon className="ml-auto mr-2"/>

          </div>
        {/* </Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center" forceMount>
        {/* <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
            {profile ? profile.email || profile.first_name : "No profile found"}
            </p>
          </div>
        </DropdownMenuLabel> */}
        {/* <DropdownMenuGroup> */}
          <Link href={"/b2c/profile"}>
            <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoon className="mr-2 h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                checked={theme==="light"}
                onCheckedChange={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                checked={theme==="dark"}
                onCheckedChange={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                checked={theme==="system"}
                onCheckedChange={() => setTheme("system")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/*<DropdownMenuItem>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
      </DropdownMenuItem>*/}
        {/* </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onLogout()} >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
            </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}