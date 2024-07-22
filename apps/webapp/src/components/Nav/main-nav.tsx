'use client'

import { BookOpen, ExternalLink, KeyRound, Scroll, Settings2, Share2, SquareGantt } from "lucide-react";
import { usePathname } from "next/navigation";
import { MouseEvent, ReactNode, useEffect, useState } from "react";

interface MainNavProps {
  onLinkClick: (name: string) => void;
  className: string;
}

interface NavLinkProps {
  name: string;
  content: ReactNode;
  onClick: (name: string) => void;
  isSelected: boolean;
  isExternal?: boolean;
  href?: string;
}

export function NavLink({
  name,
  content,
  onClick,
  isSelected,
  isExternal = false,
  href = '#'
}: NavLinkProps): JSX.Element {
  const navItemClassName = `group flex gap-1 items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer ${isSelected ? 'bg-accent' : 'transparent'
    } transition-colors`;

  function handleClick(e: MouseEvent<HTMLAnchorElement>): void {
    if (!isExternal) {
      e.preventDefault();
      onClick(name);
    }
  }

  return (
    <a
      href={isExternal ? href : '#'}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={navItemClassName}
      onClick={handleClick}
    >
      {content}
      {isExternal && <ExternalLink className="w-4" />}
    </a>
  );
}

export function MainNav({
  onLinkClick,
  className,
  ...props
}: MainNavProps) {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    setSelectedItem(pathname.substring(1))
  }, [pathname])

  return (
    <nav
      className={`grid items-start ${className}`}
      {...props}
    >
      {navItems.map(({ name, content, isExternal, href }) => (
        <NavLink
          key={name}
          name={name}
          content={content}
          onClick={onLinkClick}
          isSelected={selectedItem === name}
          isExternal={isExternal}
          href={href}
        />
      ))}
    </nav>
  );
}

const navIconClassName = "text-gray-400 w-5";
const navItems: Omit<NavLinkProps, 'onClick' | 'isSelected'>[] = [
  {
    name: 'connections',
    content: (
      <>
        <Share2 className={navIconClassName} />
        Connections
      </>
    ),
  },
  {
    name: 'events',
    content: (
      <>
        <SquareGantt className={navIconClassName} />
        Events
      </>
    ),
  },
  {
    name: 'configuration',
    content: (
      <>
        <Settings2 className={navIconClassName} />
        Configuration
      </>
    ),
  },
  {
    name: 'api-keys',
    content: (
      <>
        <KeyRound className={navIconClassName} />
        API Keys
      </>
    ),
  },
  {
    name: 'docs',
    content: (
      <>
        <BookOpen className={navIconClassName} />
        <p className="pr-2">Docs</p>
      </>
    ),
    isExternal: true,
    href: "https://docs.panora.dev/",
  },
];
