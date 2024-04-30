'use client';
import CreateUserForm from "@/components/Auth/CustomLoginComponent/CreateUserForm";
import LoginUserForm from "@/components/Auth/CustomLoginComponent/LoginUserForm";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import useFetchUserMutation from "@/hooks/mutations/useFetchUserMutation";



export default function Page() {

    const [userInitialized,setUserInitialized] = useState(true)
    const {mutate : fetchUserMutate} = useFetchUserMutation()
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
            fetchUserMutate(Cookies.get('access_token'),{
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
                <div className='flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
                    <img src="/logo.png" className='w-14' /> 
                    <Tabs defaultValue="login" className="w-[400px]">
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
