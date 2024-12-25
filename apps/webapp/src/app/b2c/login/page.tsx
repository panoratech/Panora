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
        // Get the hash from URL and set the active tab accordingly
        const hash = window.location.hash.replace('#', '');
        if (hash === 'signup') {
            setActiveTab('create');
        } else if (hash === 'login') {
            setActiveTab('login');
        }
    }, []);

    const currentTheme = theme === 'system' ? systemTheme : theme;

    // Handle tab changes and update URL
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const hash = value === 'create' ? 'signup' : 'login';
        window.history.replaceState(null, '', `#${hash}`);
    };

    useEffect(() => {
        if(profile)
        {
            router.replace('/connections');
        }
    },[profile, router]);

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
    },[profile, mutate])

    if (!mounted) {
        return null;
    }

    return (
        <>
        {!userInitialized ? 
        (
            <div className='min-h-screen flex items-center'>
                <div className='w-full max-w-[1200px] px-4 mx-auto'>
                    <div className='flex items-start justify-between gap-8'>
                        <div className='w-[450px] h-[600px]'>
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">Login</TabsTrigger>
                                    <TabsTrigger value="create">Create Account</TabsTrigger>
                                </TabsList>
                                <div className="mt-6">
                                    <TabsContent value="login" className="mt-0 h-[calc(100%-48px)]">
                                        <LoginUserForm/>
                                    </TabsContent>
                                    <TabsContent value="create" className="mt-0 h-[calc(100%-48px)]">
                                        <CreateUserForm/>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>

                        <div className='w-[450px] space-y-8'>
                            <div>
                                <img 
                                    src={currentTheme === "dark" ? "/logo-panora-white-hq.png" : "/logo-panora-black.png"} 
                                    className='w-48' 
                                    alt="Panora" 
                                />
                            </div>
                            <div className="space-y-4">

                                <h1 className="text-2xl font-bold">
                                    Welcome to Panora
                                </h1>
                                <p className="text-muted-foreground">
                                    Connect your warehouse to any e-commerce platform and let AI automate data entry into your WMS &amp; ERPs. Add revenue, not complexity to your operations.
                                </p>
                                <p className="text-muted-foreground">
                                    Use one unified API to manage orders across Shopify, Amazon, and more. Let AI handle your inventory updates while you focus on growth.
                                </p>
                                <p className="text-muted-foreground">You&apos;ll wonder how you ever managed without it.</p>
                                <p className="text-sm text-muted-foreground">
                                    Don&apos;t have an account? Create one now
                                </p>
                            </div>
                        </div>
                    </div>
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
