'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import useProfileStore from "@/state/profileStore";


const Profile = () => {

    const {profile,setProfile} = useProfileStore();
    
    const router = useRouter();

    const onLogout = () => {
        Cookies.remove("access_token")
        setProfile(null)
        router.push('/b2c/login');
    }

    return (
        <div className="ml-[200px] p-10">
        <Card>
        <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
            <div className="flex items-center">
                {profile?.first_name} {profile?.last_name}
            </div>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <h4 className="text-sm font-medium mb-2">Connected user</h4>

            <div className="flex space-x-2">
            <Input value={`${profile?.email}`} readOnly />
            <Button variant="secondary" className="shrink-0">
                Copy
            </Button>
            </div>
            <Separator className="my-4" />
            <div className="pt-4">
            <Button onClick={() => onLogout()}>
                Log Out
            </Button>
            </div>
        </CardContent>
        </Card>
        </div> 
    ); 
};


export default Profile;