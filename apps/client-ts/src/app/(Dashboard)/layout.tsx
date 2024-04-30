'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import useFetchUserMutation from "@/hooks/mutations/useFetchUserMutation";



const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [userInitialized,setUserInitialized] = useState(false)
  const router = useRouter()
  const {mutate: fetchUserMutate} = useFetchUserMutation()



  useEffect(() => {
    if(!Cookies.get('access_token'))
    {
        router.replace("/b2c/login")
    }
    else
    {
      
      fetchUserMutate(Cookies.get('access_token'),{
        onError: () => router.replace("/b2c/login"),
        onSuccess: () => setUserInitialized(true)
      })
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
