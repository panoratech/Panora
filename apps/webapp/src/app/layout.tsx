import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/Provider/provider";
import { Toaster } from "@/components/ui/sonner"
import {ThemeProvider} from '@/components/Nav/theme-provider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Panora",
  description: "Unified API",
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden`}>
        <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        >
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
