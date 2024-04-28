'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import config from "@/lib/config";
import Cookies from 'js-cookie';


const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { session, isInitialized} = useStytchSession();
  const router = useRouter();
  // useEffect(() => {

  //   if(config.DISTRIBUTION !== "selfhosted" && isInitialized && !session){
  //     router.replace("/b2c/login");
  //   }
  // }, [session,isInitialized, router]);

  // useEffect(() => {
  //   if(!Cookies.get('access_token'))
  //     {

  //       router.replace("/b2c/login");
        

  //     }
  // },[])

  if(!Cookies.get('access_token'))
    {
      router.replace("/b2c/login")
    }
  
  return (
    <>
      { !Cookies.get('access_token') ? 
      (
        <>
        </>
      ):(
        <>
        <RootLayout>
        {children}
        </RootLayout>
        </>
      )}
        
    </>
  );
}
