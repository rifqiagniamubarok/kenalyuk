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
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface MatchesSummaryResponse {
  summary?: {
    chatTabCount?: number;
  };
}

interface NavigationProps {
  menuItems: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    badgeCount?: number;
  }[];
}

export default function Navigation({ menuItems }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatBadgeCount, setChatBadgeCount] = useState<number | null>(null);
  const pathname = usePathname();

  const chatMenuItem = menuItems.find((item) => item.href === '/chat');

  useEffect(() => {
    setChatBadgeCount(chatMenuItem?.badgeCount ?? null);
  }, [chatMenuItem?.badgeCount]);

  useEffect(() => {
    if (!chatMenuItem) {
      setChatBadgeCount(null);
      return;
    }

    let cancelled = false;

    const refreshChatBadge = async () => {
      try {
        const response = await fetch('/api/matches', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MatchesSummaryResponse;
        const nextCount = data.summary?.chatTabCount;

        if (!cancelled && typeof nextCount === 'number') {
          setChatBadgeCount(nextCount);
        }
      } catch {
        return;
      }
    };

    void refreshChatBadge();
    const intervalId = window.setInterval(() => {
      void refreshChatBadge();
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshChatBadge();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatMenuItem]);

  const getResolvedBadgeCount = (item: NavigationProps['menuItems'][number]) => {
    return item.href === '/chat' ? (chatBadgeCount ?? item.badgeCount ?? 0) : (item.badgeCount ?? 0);
  };

  const renderMenuLabel = (item: NavigationProps['menuItems'][number]) => {
    const resolvedBadgeCount = getResolvedBadgeCount(item);

    if (resolvedBadgeCount <= 0) {
      return item.label;
    }

    return (
      <>
        {item.label}
        <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2 py-0.5">{resolvedBadgeCount}</span>
      </>
    );
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          wrapper: 'px-3 sm:px-4 bg-white/95 rounded-2xl border border-gray-200 shadow-sm',
          base: 'bg-transparent',
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
            {(() => {
              const resolvedBadgeCount = getResolvedBadgeCount(item);

              return (
            <Link
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'text-primary bg-primary/10'
                  : 'text-text-secondary hover:text-primary hover:bg-primary/5'
              } transition-colors duration-200 relative flex h-10 w-10 items-center justify-center rounded-full`}
              aria-label={item.label}
            >
              {item.icon}
              {resolvedBadgeCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[1rem] rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-4 text-white">
                  {resolvedBadgeCount}
                </span>
              )}
              <span className="sr-only">{item.label}</span>
            </Link>
              );
            })()}
          </NavbarItem>
        ))}
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
    </div>
  );
}
