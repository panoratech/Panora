'use client'

import { BookOpen, ExternalLink, KeyRound, Scroll, Settings2, Share2, SquareGantt } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  isExternal?: boolean;
}

const items: NavItem[] = [
  {
    title: "Connections",
    href: "connections",
    icon: Share2
  },
  {
    title: "Events",
    href: "events",
    icon: Scroll
  },
  {
    title: "Configuration",
    href: "configuration",
    icon: Settings2
  },
  {
    title: "API Keys",
    href: "api-keys",
    icon: KeyRound
  },
  {
    title: "Docs",
    href: "https://docs.panora.dev/",
    icon: BookOpen,
    isExternal: true
  }
];

export function MainNav({
  className,
  onLinkClick,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  onLinkClick: (page: string) => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => (
        <div
          key={item.href}
          onClick={() => onLinkClick(item.href)}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
            "transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            pathname === `/${item.href}`
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
          {item.isExternal && <ExternalLink className="ml-2 h-4 w-4" />}
        </div>
      ))}
    </nav>
  );
}
