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
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";

const Profile = () => {
    const stytch = useStytch();
    // Get the Stytch User object if available
    const { user } = useStytchUser();
    // Get the Stytch Session object if available
    const { session } = useStytchSession();
    const router = useRouter();

    return (
        <div className="ml-[200px] p-10">
        <Card>
        <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
            <div className="flex items-center">
                {user?.name.first_name} {user?.name.last_name}
            </div>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <h4 className="text-sm font-medium mb-2">Connected user</h4>

            <div className="flex space-x-2">
            <Input value={`${user?.emails[0].email}`} readOnly />
            <Button variant="secondary" className="shrink-0">
                Copy
            </Button>
            </div>
            <Separator className="my-4" />
            <div className="pt-4">
            <Button onClick={() => {
                stytch.session.revoke()
                router.push('/b2c/login');
            }}>
                Log Out
            </Button>
            </div>
        </CardContent>
        </Card>
        </div> 
    ); 
};


export default Profile;