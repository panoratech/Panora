import { useState } from "react";

export function MainNav({
  onLinkClick,
  className,
  ...props
}: {
  onLinkClick: (name: string) => void;
  className: string;
}) {
  const [selectedItem, setSelectedItem] = useState<string>("jobs");

  const navItemClassName = (itemName: string) =>
    `text-sm border-b font-medium w-full text-left px-4 py-2 hover:bg-gray-900 cursor-pointer ${
      selectedItem === itemName ? "bg-gray-900" : "text-muted-foreground"
    } transition-colors`;
  
  function click(name: string) {
    setSelectedItem(name);
    onLinkClick(name);
  }

  return (
    <nav
      className={`flex flex-col items-start ${className}`}
      {...props}
    >
      <a
        className={navItemClassName('jobs')}
        onClick={() => click('jobs')}
      >
        Jobs
      </a>
      <a
        className={navItemClassName('connections')}
        onClick={() => click('connections')}
      >
        Connections
      </a>
      {/*<a
        className={navItemClassName('integrations')}
        onClick={() => click('integrations')}
      >
        Integrations
  </a>*/}
      <a
        className={navItemClassName('linked-accounts')}
        onClick={() => click('linked-accounts')}
      >
        Linked Accounts
      </a>
      <a
        className={navItemClassName('configuration')}
        onClick={() => click('configuration')}
      >
        Configuration
      </a>
      <a
        className={navItemClassName('api-keys')}
        onClick={() => click('api-keys')}
      >
        API Keys
      </a>
      <a
        className={navItemClassName('docs')}
        href="https://docs.panora.dev/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Docs
      </a>
      {/* Add other nav items as needed */}
    </nav>
  );
}
