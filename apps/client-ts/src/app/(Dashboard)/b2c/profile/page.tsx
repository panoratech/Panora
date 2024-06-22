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
import useProjectStore from "@/state/projectStore"
import { useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { toast } from "sonner";


const Profile = () => {
    const [copied, setCopied] = useState(false);
    const { profile, setProfile } = useProfileStore();
    const { setIdProject } = useProjectStore();
    const queryClient = useQueryClient();
    
    const router = useRouter();

    const handleCopy = async (email: string) => {
        try {
          await navigator.clipboard.writeText(email)
          setCopied(true);
          toast.success("Email copied", {
            action: {
              label: "Close",
              onClick: () => console.log("Close"),
            },
          })
          setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      };

    const onLogout = () => {
        router.push('/b2c/login')
        Cookies.remove("access_token")
        setProfile(null)
        setIdProject("")
        queryClient.clear()
    }

    return (
        <div className="p-10">
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

            <div className="flex space-x-2 items-center">
            <Input value={`${profile?.email}`} readOnly />
            <Button type="button" onClick={() => handleCopy(profile?.email!)} size="sm" className="h-7 gap-1"> 
                {copied ? 'Copied!' : (
                    <>
                    <p className="mr-1" >Copy</p>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </>
                )}
            </Button>
            </div>
            <Separator className="my-4" />
            <div className="pt-4">
            <Button onClick={() => onLogout()} size="sm" className="h-7 gap-1">
                Log Out
            </Button>
            </div>
        </CardContent>
        </Card>
        </div> 
    ); 
};

export default Profile;