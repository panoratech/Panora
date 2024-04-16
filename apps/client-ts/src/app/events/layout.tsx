'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useStytchSession } from "@stytch/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, isInitialized} = useStytchSession();
  const router = useRouter();
  useEffect(() => {
    if (!isInitialized) {

      router.replace("/b2c/login");
    }
  }, [session, router]);
  
  return (
    <>
        <RootLayout/>
        {children}
    </>
  );
}
