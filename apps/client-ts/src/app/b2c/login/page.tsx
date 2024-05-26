'use client';
import CreateUserForm from "@/components/Auth/CustomLoginComponent/CreateUserForm";
import LoginUserForm from "@/components/Auth/CustomLoginComponent/LoginUserForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import useProfileStore from "@/state/profileStore";
import useUser from "@/hooks/get/useUser";

export default function Page() {
    const [userInitialized,setUserInitialized] = useState(true)
    const {mutate} = useUser()
    const router = useRouter()
    const {profile} = useProfileStore();

    useEffect(() => {
        if(profile)
        {
            router.replace('/connections');
        }

    },[profile]);

    useEffect(() => {

        if(!Cookies.get('access_token'))
            {
                setUserInitialized(false);
            }

        if(Cookies.get('access_token') && !profile)
        {
            mutate(Cookies.get('access_token'),{
                onError: () => setUserInitialized(false)
            })
        }

        // if(profile)
        // {
        //     router.replace('/connections');
        // }

    },[])

    return (
        <>
        
        {!userInitialized ? 
        (
            <div className='min-h-screen grid lg:grid-cols-2 mx-auto text-left'>
                <div className='flex-1 flex flex-col py-12 sm:items-center lg:flex-none lg:px-20 xl:px-24'>
                    <div className="w-[400px]">
                    <img src="/logo.png" className='w-14' /> 
                    </div>
                    <Tabs defaultValue="login" className="w-[400px] space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="create">Create Account</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <LoginUserForm/>
                        </TabsContent>
                        <TabsContent value="create">
                            <CreateUserForm/>
                        </TabsContent>
                    </Tabs>
                </div>       
                <div className='hidden lg:block relative flex-1'>
                    <img className='absolute inset-0 h-full w-full object-cover border-l' src="/bgbg.jpeg" alt='Login Page Image' />
                </div>
            </div>
        ) : 
        (
            <></>
        )    
    }
        </>
    )
}
