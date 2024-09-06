'use client'

import { useEffect } from 'react';
import { MainNav } from '@/components/Nav/main-nav';
import { SmallNav } from '@/components/Nav/main-nav-sm';
import { UserNav } from '@/components/Nav/user-nav';
import TeamSwitcher from '@/components/shared/team-switcher';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import useProjectStore from '@/state/projectStore';
import { ThemeToggle } from '@/components/Nav/theme-toggle';
import useProjects from '@/hooks/get/useProjects';
import useRefreshAccessTokenMutation from '@/hooks/create/useRefreshAccessToken';
import { useTheme } from 'next-themes';
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const RootLayout = ({children}:{children:React.ReactNode}) => {
  const router = useRouter()
  const base = process.env.NEXT_PUBLIC_WEBAPP_DOMAIN;
  const [copiesProjectID, SetCopiesProjectID] = useState<boolean>(false);
  const {data : projectsData} = useProjects();
  const { idProject, setIdProject } = useProjectStore();
  const {mutate : refreshAccessToken} = useRefreshAccessTokenMutation()
  const { theme } = useTheme()

  useEffect(() => {
    if(projectsData)
      {
        console.log("Projects : ",projectsData);
        if(idProject==="" && projectsData.length>0)
          {
            console.log("Project Id setting : ",projectsData[0]?.id_project)
            setIdProject(projectsData[0]?.id_project);
          }
      }
  },[idProject, projectsData, refreshAccessToken, setIdProject])
  
  const handlePageChange = (page: string) => {
    if (page) {
      router.push(`${base}/${page}`);
    } else {
      console.error(`Page ${page} is undefined`);
    }
  };

  const handleCopyRight = () => {
    navigator.clipboard.writeText(idProject);
    toast.success("Project ID copied!", {
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      })
    SetCopiesProjectID(true);
    setTimeout(() => {
        SetCopiesProjectID(false);
    }, 2000);
  };

  return (
    <>        
      {/* <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
          <nav className="h-14 flex items-center justify-between px-4">
            <div className="hidden lg:block">
              <Link href='/'>
                {theme == "light" ? <img src="/logo-panora-black.png" className='w-14' /> : <img src="/logo-panora-white-hq.png" className='w-14' />}
              </Link>
            </div>
            <div className={cn("block lg:!hidden")}>
              <SmallNav onLinkClick={handlePageChange} />
            </div>

            <div className="flex items-center gap-2">
              <UserNav />
              <ThemeToggle />
            </div>
          </nav>
        </div> */}
          <div className="flex h-screen overflow-hidden">
              
            <nav
              className={cn(`relative hidden h-screen border-r lg:block w-72`)}
            >
              <div className='flex items-center justify-center min-w-full'>
                <div className="hidden lg:block pt-5">
                      <Link href='/'>
                        {theme == "light" ? <img src="/logo-panora-black.png" className='w-14' /> : <img src="/logo-panora-white-hq.png" className='w-14' />}
                      </Link>
                </div>

              </div>
              
              <div className="space-y-4 py-4 pt-10">
                <div className="px-3 py-2">
                  <div className="space-y-3">
                    <div className='flex gap-2 items-center'>
                      <TeamSwitcher className='w-40 ml-3' projects={projectsData? projectsData : []}/>
                      <div 
                        className="cursor-pointer" 
                        onClick={handleCopyRight}
                    >
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="outline">{copiesProjectID ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="15" height="15" fill="#ffffff">
                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
                                    </svg>
                                    ) : (
                                    <>
                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                        </svg>
                                    </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">Copy Project ID</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    </div>
                    <p className='text-xs cursor-default dark:text-gray-400 text-gray-950 font-semibold pt-5'>General</p>
                    <MainNav onLinkClick={handlePageChange} className=''/>
                  </div>
                </div>
              </div>

              <div className='absolute bottom-0 left-0 w-full cursor-pointer'>
                <UserNav/>
              </div>
            </nav>
            <div className={cn("block lg:!hidden")}>
              <SmallNav onLinkClick={handlePageChange} />
            </div>
            <main className="w-full overflow-y-scroll">{children}</main>

        </div>
     </>

  )
  
};