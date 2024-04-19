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
  const { session } = useStytchSession();
  console.log("session inside connections page is "+ JSON.stringify(session))
  const router = useRouter();
  useEffect(() => {
    if(config.DISTRIBUTION !== "selfhost" && !session){
      router.push("/b2c/login");
    }
  }, [session, router]);
  
  return (
    <>
        <RootLayout/>
        {children}
    </>
  );
}
