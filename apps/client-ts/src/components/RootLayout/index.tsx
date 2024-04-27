'use client'

import { useState, useEffect } from 'react';
import { MainNav } from './../Nav/main-nav';
import { SmallNav } from './../Nav/main-nav-sm';
import { UserNav } from './../Nav/user-nav';
import TeamSwitcher from './../shared/team-switcher';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import config from '@/lib/config';
import useProfile from '@/hooks/useProfile';
import useProfileStore from '@/state/profileStore';
import useProjectStore from '@/state/projectStore';

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





export const RootLayout = () => {
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
    //console.log(`${base}/${page}`)
    if (page) {
      router.push(`${base}/${page}`);
    } else {
      console.error(`Page ${page} is undefined`);
    }
  };

  const lgBreakpoint = 1024; // Tailwind's 'lg' breakpoint

  return (
    <div>
      {width < lgBreakpoint ? (
        <SmallNav onLinkClick={handlePageChange} />
      ) : (
        <div className='items-center hidden lg:flex lg:flex-col border-r fixed left-0 bg-opacity-90 backdrop-filter backdrop-blur-lg w-[200px] h-screen'>
          <div className='flex lg:flex-col items-center py-4 space-y-4'>
            <div className='flex flex-row justify-between items-center w-full px-6'>
              <Link href='/'>
                <img src="/logo.png" className='w-14' />
              </Link>
            </div>
            <TeamSwitcher className='w-40 ml-3' userId={profile?.id_user!}/>
            <MainNav
              className='flex lg:flex-col mx-auto w-[200px] space-y-0'
              onLinkClick={handlePageChange}
            />
            {
              config.DISTRIBUTION === "managed" && 
              (
                <div className='ml-auto flex lg:flex-col items-center space-x-4 w-full'>
                  <UserNav />
                </div>
              )
            }
          </div>
        </div>
      )}
      <div className='flex-1 space-y-4 pt-6 px-10 lg:ml-[200px]'>
        {/*<Outlet />*/}
      </div>
    </div>
  );
};