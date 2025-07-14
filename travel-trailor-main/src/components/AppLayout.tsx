
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Plane,
  History,
  LogOut,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLogo } from './icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/auth-provider';
import { Skeleton } from './ui/skeleton';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      href: '/dashboard',
      label: 'New Trip',
      icon: Plane,
    },
    {
      href: '/dashboard/history',
      label: 'My Trips',
      icon: History,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: User,
    }
  ];

  const LogoutButton = () => {
    if (loading) {
      return <Skeleton className="h-9 w-24" />;
    }
    if (!user) return null;

    return (
        <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <AppLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">TripTailor</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           {loading ? (
             <div className="flex flex-col gap-2 p-2">
               <Skeleton className="h-4 w-full" />
             </div>
           ) : user ? (
            <div className="flex flex-col gap-1 w-full p-2">
              <div className="text-xs text-muted-foreground truncate" title={user.email ?? ''}>
                {user.email}
              </div>
            </div>
           ) : null}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold capitalize font-headline">
            {pathname.split('/').pop()?.replace('-', ' ') || 'New Trip'}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
