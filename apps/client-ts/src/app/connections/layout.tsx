import { Inter } from "next/font/google";
import "./../globals.css";
import { RootLayout } from "@/components/RootLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <RootLayout/>
        {children}
    </>
  );
}
