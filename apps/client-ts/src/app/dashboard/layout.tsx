'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useStytchSession } from "@stytch/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import config from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session,isInitialized } = useStytchSession();
  const router = useRouter();
  useEffect(() => {
    if(config.DISTRIBUTION !== "selfhosted" && isInitialized && !session){
      router.replace("/b2c/login");
    }
  }, [session,isInitialized, router]);
  
  return (
    <>
        <RootLayout>
        {children}
        </RootLayout>
    </>
  );
}
