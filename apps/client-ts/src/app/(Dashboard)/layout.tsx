'use client'
import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import config from "@/lib/config";



const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  


  

  
  
  return (
    <>   
        <RootLayout>
        {children}
        </RootLayout>   
    </>
  );
}
