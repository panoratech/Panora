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
  const { session } = useStytchSession();
  const router = useRouter();
  useEffect(() => {
    if (!session) {
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
