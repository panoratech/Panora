import { useState, useEffect } from 'react';
import { MainNav } from './homepage/components/main-nav';
import { SmallNav } from './homepage/components/main-nav-sm';
import { UserNav } from './homepage/components/user-nav';
import TeamSwitcher from './shared/team-switcher';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from './theme-switcher';
import { Toaster } from "@/components/ui/sonner"

export const RootLayout = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  const handlePageChange = (page: string) => {
    navigate(page);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lgBreakpoint = 1024; // Tailwind's 'lg' breakpoint

  return (
    <div>
      {windowWidth < lgBreakpoint ? (
        <SmallNav onLinkClick={handlePageChange} />
      ) : (
        <div className='items-center hidden lg:flex lg:flex-col border-r fixed left-0 bg-opacity-90 backdrop-filter backdrop-blur-lg w-[200px] h-screen'>
          <div className='flex lg:flex-col items-center py-4 space-y-4'>
            <div className='flex flex-row justify-between items-center w-full px-6'>
              <Link to='/'>
                <img src='logo.png' className='w-14' />
              </Link>
              <ThemeSwitcher />
            </div>
            <TeamSwitcher className='w-40 ml-3' />
            <MainNav
              className='flex lg:flex-col mx-auto w-[200px] space-y-0'
              onLinkClick={handlePageChange}
            />
            <div className='ml-auto flex lg:flex-col items-center space-x-4 w-full'>
              <UserNav />
            </div>
          </div>
        </div>
      )}
      <div className='flex-1 space-y-4 pt-6 px-10 lg:ml-[200px]'>
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};
