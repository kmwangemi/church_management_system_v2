'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { useAuthContext } from '@/contexts/AuthContext';
import { getFirstLetter } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Globe,
  LogOut,
  MapPin,
  Menu,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: BarChart3 },
  { name: 'Churches', href: '/superadmin/churches', icon: Building2 },
  { name: 'Branches', href: '/superadmin/branches', icon: MapPin },
  { name: 'Analytics', href: '/superadmin/analytics', icon: TrendingUp },
  { name: 'Users', href: '/superadmin/users', icon: Users },
  { name: 'System Health', href: '/superadmin/system-health', icon: Activity },
  { name: 'Global Settings', href: '/superadmin/settings', icon: Settings },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isLoading, isAuthenticated, isError, logout } = useAuthContext();
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setIsLoggingOut(false);
  };
  const NavItems = () => (
    <>
      {navigation.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className='h-4 w-4' />
            {item.name}
          </Link>
        );
      })}
    </>
  );
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side='left' className='w-64 p-0'>
          <SheetTitle className='sr-only'>
            SuperAdmin Navigation Menu
          </SheetTitle>
          <SheetDescription className='sr-only'>
            Main navigation menu for the SuperAdmin portal
          </SheetDescription>
          <div className='flex h-full flex-col'>
            <div className='flex h-16 items-center gap-2 border-b px-6'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600'>
                <Shield className='h-4 w-4 text-white' />
              </div>
              <div>
                <h2 className='text-lg font-semibold'>SuperAdmin</h2>
                <p className='text-xs text-gray-500'>ChurchFlow Global</p>
              </div>
            </div>
            <nav className='flex-1 space-y-1 p-4'>
              <NavItems />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop sidebar */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col'>
        <div className='flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
          <div className='flex h-16 shrink-0 items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600'>
              <Shield className='h-4 w-4 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>SuperAdmin</h2>
              <p className='text-xs text-gray-500'>ChurchFlow Global</p>
            </div>
          </div>
          <nav className='flex flex-1 flex-col'>
            <ul role='list' className='flex flex-1 flex-col gap-y-7'>
              <li>
                <ul role='list' className='-mx-2 space-y-1'>
                  <NavItems />
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top bar */}
        <div className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8'>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='sm' className='lg:hidden'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-64 p-0'>
              <SheetTitle className='sr-only'>
                SuperAdmin Navigation Menu
              </SheetTitle>
              <SheetDescription className='sr-only'>
                Main navigation menu for the SuperAdmin portal
              </SheetDescription>
              <div className='flex h-full flex-col'>
                <div className='flex h-16 items-center gap-2 border-b px-6'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600'>
                    <Shield className='h-4 w-4 text-white' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold'>SuperAdmin</h2>
                    <p className='text-xs text-gray-500'>ChurchFlow Global</p>
                  </div>
                </div>
                <nav className='flex-1 space-y-1 p-4'>
                  <NavItems />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className='flex flex-1 gap-x-4 self-stretch lg:gap-x-6'>
            <div className='flex flex-1 items-center'>
              <div className='flex items-center gap-2'>
                <Globe className='h-5 w-5 text-purple-600' />
                <span className='text-sm font-medium text-gray-900'>
                  Global System Management
                </span>
              </div>
            </div>
            <div className='flex items-center gap-x-4 lg:gap-x-6'>
              <Button variant='ghost' size='sm' className='relative'>
                <Bell className='h-5 w-5' />
                <Badge className='-right-1 -top-1 absolute flex size-5 items-center justify-center rounded-full bg-red-500 text-white text-xs'>
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-8 w-8 rounded-full'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={user?.profilePictureUrl || ''}
                        alt={user?.firstName || 'Admin'}
                      />
                      <AvatarFallback>{`${getFirstLetter(
                        user?.firstName || '',
                      )}${getFirstLetter(
                        user?.lastName || '',
                      )}`}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        Super Admin
                      </p>
                      <p className='text-xs leading-none text-muted-foreground'>
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className='py-8'>
          <div className='px-4 sm:px-6 lg:px-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
