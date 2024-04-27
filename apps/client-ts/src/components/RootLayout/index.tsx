'use client'

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/Nav/main-nav';
import { SmallNav } from '@/components/Nav/main-nav-sm';
import { UserNav } from '@/components/Nav/user-nav';
import TeamSwitcher from '@/components/shared/team-switcher';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import config from '@/lib/config';
import { cn } from "@/lib/utils";
import useProfile from '@/hooks/useProfile';
import useProfileStore from '@/state/profileStore';
import useProjectStore from '@/state/projectStore';
import { ThemeToggle } from '@/components/Nav/theme-toggle';
import { projects as Project } from 'api';


const useDeviceSize = () => {

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const handleWindowResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useEffect(() => {
    // component is mounted and window is available
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    // unsubscribe from the event on component unmount
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return [width, height]

}


type User_ = User & { projects: Project[] };
type User = {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  id_organization?: string;
}

const dummyUser : User_ = {
  id_user:"0ce39030-2901-4c56-8db0-5e326182ec6b",
  email:"dummy@gmail.com",
  first_name:"ms",
  last_name:"suthar",
  projects:[]
}





export const RootLayout = ({children}:{children:React.ReactNode}) => {
  const [width, height] = useDeviceSize();
  const router = useRouter()
  const base = process.env.NEXT_PUBLIC_WEBAPP_DOMAIN;
  // const { user } = useStytchUser();
  // const {data, isLoading, isError, error} = useProfile(user?.user_id!);

  // if(isLoading) {
  //   console.log("loading profiles");
  // }
  // if(isError){
  //   console.log('Profiles fetch error: '+ error)
  // }

  const { profile, setProfile } = useProfileStore();

  const { setIdProject } = useProjectStore();

  // useEffect(()=> { 
  //   if(data){
  //     //console.log("data from bundled call is "+ JSON.stringify(data));
  //     setProfile({
  //       id_user: data.id_user,
  //       email: data.email!,
  //       first_name: data.first_name,
  //       last_name: data.last_name,
  //       projects: data.projects
  //       //id_organization: data.id_organization as string,
  //     })
  //     console.log("data projects are => "+ JSON.stringify(data.projects));
      
  //     if(data.projects && data.projects.length > 0 && data.projects[0].id_project){
  //       setIdProject(data.projects[0].id_project)
  //     }
  //   }
  // }, [data, setIdProject, setProfile]);

  useEffect(() => {
    setProfile(dummyUser);
  },[])

  
  const handlePageChange = (page: string) => {
    if (page) {
      router.push(`${base}/${page}`);
    } else {
      console.error(`Page ${page} is undefined`);
    }
  };


  return (
    <>
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden lg:block">
          <Link href='/'>
            <img src="/logo.png" className='w-14' />
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
    </div>
    <div className="flex h-screen overflow-hidden">
      <nav
        className={cn(`relative hidden h-screen border-r pt-16 lg:block w-72`)}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              
              <TeamSwitcher className='w-40 ml-3' userId={profile?.id_user} />
              <MainNav onLinkClick={handlePageChange} className=''/>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full pt-16">{children}</main>

    </div>
    </>
  );
};