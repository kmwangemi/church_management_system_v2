'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { IUser } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Bell, BookOpen, LogOut, Menu, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { ChurchNavigation } from './church-navigation';
import { ChurchSidebar } from './church-sidebar';

export function ChurchClient({
  user,
  children,
}: {
  user: IUser;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({});
      window.location.href = '/auth/login';
    } catch (_error) {
      setIsLoggingOut(false);
    } finally {
      setIsLoggingOut(false);
    }
  };
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col border-gray-200 border-r">
          <ChurchSidebar
            pathname={pathname}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
        </div>
      </div>
      {/* Mobile Sidebar */}
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetContent className="w-64 p-0" side="left">
          <SheetTitle className="sr-only">Dashboard Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the dashboard
          </SheetDescription>
          <ChurchSidebar
            mobile
            pathname={pathname}
            setSidebarOpen={setSidebarOpen}
            user={user}
          />
        </SheetContent>
      </Sheet>
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-gray-200 border-b bg-white px-4 py-2.5">
          <div className="flex items-center space-x-4">
            <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="sm" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-64 p-0" side="left">
                <SheetTitle className="sr-only">
                  Dashboard Navigation Menu
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu for the dashboard
                </SheetDescription>
                <ChurchSidebar
                  mobile
                  pathname={pathname}
                  setSidebarOpen={setSidebarOpen}
                  user={user}
                />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-semibold text-gray-900 text-xl">
                {ChurchNavigation.find((item) => item.href === pathname)
                  ?.name || 'Dashboard'}
              </h1>
              <p className="hidden text-gray-500 text-sm sm:block">
                {'churchName' in user && (user as any).churchName
                  ? (user as any).churchName
                  : 'Church Management System'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/notifications">
              <Button className="relative" size="sm" variant="ghost">
                <Bell className="h-4 w-4" />
                <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  3
                </span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative h-8 w-8 rounded-full"
                  variant="ghost"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={user?.name || 'Admin'}
                      src={user?.image || ''}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0].toUpperCase())
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {capitalizeFirstLetter(user?.role || 'Admin')}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
