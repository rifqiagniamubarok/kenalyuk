'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface NavigationProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  menuItems: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    badgeCount?: number;
  }[];
}

export default function Navigation({ user, menuItems }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const renderMenuLabel = (item: NavigationProps['menuItems'][number]) => {
    if (!item.badgeCount || item.badgeCount <= 0) {
      return item.label;
    }

    return (
      <>
        {item.label}
        <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2 py-0.5">{item.badgeCount}</span>
      </>
    );
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        wrapper: 'max-w-full px-4 sm:px-6 bg-white border-b border-gray-100',
        base: 'bg-white',
      }}
    >
      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
      </NavbarContent>

      {/* Brand */}
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link href="/dashboard" className="font-bold text-2xl text-primary">
            Kenalyuk
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <Link href="/dashboard" className="font-bold text-2xl text-primary">
            Kenalyuk
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop menu items */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <Link
              href={item.href}
              className={`${
                pathname === item.href ? 'text-primary font-semibold' : 'text-text-secondary hover:text-primary'
              } transition-colors duration-200 flex items-center gap-2`}
            >
              {item.icon}
              {renderMenuLabel(item)}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* User menu */}
      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              suppressHydrationWarning
              isBordered
              as="button"
              className="transition-transform"
              color="success"
              name={user.name || user.email || 'User'}
              size="sm"
              showFallback
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold text-primary">{user.email}</p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout} textValue="Logout">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link className={`w-full ${pathname === item.href ? 'text-primary font-semibold' : 'text-text-secondary'}`} href={item.href} onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-2 py-2">
                {item.icon}
                {renderMenuLabel(item)}
              </div>
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button color="danger" variant="flat" onPress={handleLogout} className="w-full">
            Log Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
