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
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Page() {
    const [userInitialized,setUserInitialized] = useState(true)
    const {mutate} = useUser()
    const router = useRouter()
    const {profile} = useProfileStore();
    const [activeTab, setActiveTab] = useState('login');
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = theme === 'system' ? systemTheme : theme;

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

    if (!mounted) {
        return (
            <div className='min-h-screen flex justify-center items-center'>
                <div className='w-[450px] min-h-[500px] p-8 rounded-lg border bg-card'>
                    <div className="flex justify-center mb-8">
                        <img 
                            src="/logo-panora-black.png"
                            className='w-32' 
                            alt="Panora" 
                        /> 
                    </div>
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
                        <p className="text-sm text-muted-foreground">Sign in to your account or create one</p>
                    </div>
                    <Tabs defaultValue="login" className="space-y-6">
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
                    
                    {activeTab === 'forgot-password' && (
                        <Button variant="link" onClick={() => setActiveTab('login')}>
                            Back to Login
                        </Button>
                    )}
                </div>       
            </div>
        );
    }

    return (
        <>
        
        {!userInitialized ? 
        (
            <div className='min-h-screen flex justify-center items-center'>
                <div className='w-[450px] min-h-[500px] p-8 rounded-lg border bg-card'>
                    <div className="flex justify-center mb-8">
                        <img 
                            src={currentTheme === "dark" ? "/logo-panora-white-hq.png" : "/logo-panora-black.png"} 
                            className='w-32' 
                            alt="Panora" 
                        /> 
                    </div>
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
                        <p className="text-sm text-muted-foreground">Sign in to your account or create one</p>
                    </div>
                    <Tabs defaultValue="login" className="space-y-6">
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
                    
                    {activeTab === 'forgot-password' && (
                        <Button variant="link" onClick={() => setActiveTab('login')}>
                            Back to Login
                        </Button>
                    )}
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
