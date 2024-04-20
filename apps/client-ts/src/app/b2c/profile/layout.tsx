'use client'
import "./../../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useStytchSession } from "@stytch/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session,isInitialized } = useStytchSession();
  const router = useRouter();
  useEffect(() => {
    if (isInitialized && !session) {
      router.replace("/b2c/login");
    }
  }, [session, isInitialized, router]);
  console.log('WEBAPP DOMAIN is '+ process.env.NEXT_PUBLIC_WEBAPP_DOMAIN)
  
  return (
    <>
        <RootLayout/>
        {children}
    </>
  );
}
