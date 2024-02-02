import { DesktopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';

import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { type Theme, useTheme } from './theme-provider';

const themeElements: Record<Theme, React.ReactNode> = {
  light: <SunIcon className='h-4 w-4' />,
  dark: <MoonIcon className='h-4 w-4' />,
  system: <DesktopIcon className='h-4 w-4' />,
};

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='rounded-full' size='icon'>
          {themeElements[theme]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-[5rem]'>
        {Object.entries(themeElements).map(([themeOption, icon]) => (
          <DropdownMenuCheckboxItem
            key={themeOption}
            checked={theme === themeOption}
            onCheckedChange={() => setTheme(themeOption as Theme)}
          >
            {icon}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
