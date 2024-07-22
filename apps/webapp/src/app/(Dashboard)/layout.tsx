'use client'
import "../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import useUser from "@/hooks/get/useUser";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [userInitialized,setUserInitialized] = useState(false)
  const router = useRouter()
  const { mutate } = useUser()

  useEffect(() => {
    if(!Cookies.get('access_token')) {
      router.replace("/b2c/login")
    }else {
      mutate(
        Cookies.get('access_token'),
        {
        onError: () => router.replace("/b2c/login"),
        onSuccess: () => setUserInitialized(true)
        }
      )
    }
  },[])
  
  return (
    <>   {userInitialized ? (
      <>
        <RootLayout>
          {children}
        </RootLayout> 
      </>
    ) : (
      <>
        
      </>
    )}
          
    </>
  );
}
