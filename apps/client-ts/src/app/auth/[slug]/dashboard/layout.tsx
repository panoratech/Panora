import "./../../../globals.css";
import { RootLayout } from "@/components/RootLayout";


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
