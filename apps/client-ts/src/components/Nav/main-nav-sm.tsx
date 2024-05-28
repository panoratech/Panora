"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useTheme } from 'next-themes';
import {User,LogOut} from 'lucide-react';
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import useProjectStore from "@/state/projectStore";
import { useQueryClient } from '@tanstack/react-query';
import useProfileStore from "@/state/profileStore";


export function SmallNav({ 
  onLinkClick 
} : {
  onLinkClick: (name: string) => void
}) {
  const [selectedItem, setSelectedItem] = useState<string>("dashboard");
  const router = useRouter();
  const { profile, setProfile } = useProfileStore();
  const { setIdProject } = useProjectStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { theme } = useTheme()
  const navItemClassName = (itemName: string) =>
    `text-sm border-b font-medium w-full text-left mx-0 py-2 dark:hover:bg-zinc-900 hover:bg-zinc-200 cursor-pointer ${
    selectedItem === itemName ? "dark:bg-zinc-800 bg-zinc-200" : "text-muted-foreground"
  } transition-colors`;

  function click(name: string) {
    setSelectedItem(name);
    onLinkClick(name);
    setOpen(false);
  }

  const onLogout = () => {
    router.push('/b2c/login')
    Cookies.remove("access_token")
    setProfile(null)
    setIdProject("")
    queryClient.clear()
  }

  return (
    <div className="flex flex-row mx-0 px-0">
      <Sheet key={"left"} open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className=" ml-4 mt-4">
          <Button variant="outline" onClick={()=> setOpen(true)}><MenuIcon className="h-6 w-6" /></Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="p-0  w-[200px]">
          <SheetHeader className="flex items-center">
            <SheetTitle className="mx-4 my-4">
              <Link href="/" className="flex flex-row" onClick={() => setOpen(false)}>
                {theme == "light" ? <img src="/logo-panora-black.png" className='w-12' /> : <img src="/logo-panora-white-hq.png" className='w-12' />}
              
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav
              className={`flex flex-col items-start mt-6`}
            >
            <a
                className={navItemClassName('connections')}
                onClick={() => click('connections')}
              >
              <p className="mx-4">Connections</p>
            </a>
            <a
                className={navItemClassName('events')}
                onClick={() => click('events')}
              >
              <p className="mx-4">Events</p>

            </a>
            <a
                className={navItemClassName('configuration')}
                onClick={() => click('configuration')}
              >
              <p className="mx-4">Configuration</p>
            </a>
            <a
                className={navItemClassName('api-keys')}
                onClick={() => click('api-keys')}
              >
              <p className="mx-4">API Keys</p>
            </a>
            <a
              className={`${navItemClassName('docs')} flex items-center`}
              href="https://docs.panora.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="mx-4">Docs</p>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </a>
            <a
                className={`${navItemClassName('b2c/profile')} flex gap-2 px-4`}
                onClick={() => click('b2c/profile')}
              >
              <User className="h-4 w-4" />
              <p className="">Profile</p>
            </a>
            <a
                className={`${navItemClassName('log-out')} px-4 flex gap-2`}
                onClick={() => onLogout()}
              >
              <LogOut className="h-4 w-4" />
              <p className="">Log Out</p>
            </a>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
