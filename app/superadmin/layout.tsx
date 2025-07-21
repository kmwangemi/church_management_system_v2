'use client';

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
import { useAuthContext } from '@/contexts/auth-context';
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
import type React from 'react';
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
  // const { user, isLoading, isAuthenticated, isError, logout } =
  //   useAuthContext();
  const { user, logout } = useAuthContext();
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setIsLoggingOut(false);
  };
  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            href={item.href}
            key={item.name}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetContent className="w-64 p-0" side="left">
          <SheetTitle className="sr-only">
            SuperAdmin Navigation Menu
          </SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the SuperAdmin portal
          </SheetDescription>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-2 border-b px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">SuperAdmin</h2>
                <p className="text-gray-500 text-xs">ChurchFlow Global</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              <NavItems />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-gray-200 border-r bg-white px-6">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">SuperAdmin</h2>
              <p className="text-gray-500 text-xs">ChurchFlow Global</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  <NavItems />
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-gray-200 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
            <SheetTrigger asChild>
              <Button className="lg:hidden" size="sm" variant="ghost">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-64 p-0" side="left">
              <SheetTitle className="sr-only">
                SuperAdmin Navigation Menu
              </SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation menu for the SuperAdmin portal
              </SheetDescription>
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center gap-2 border-b px-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-600">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">SuperAdmin</h2>
                    <p className="text-gray-500 text-xs">ChurchFlow Global</p>
                  </div>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                  <NavItems />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 text-sm">
                  Global System Management
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button className="relative" size="sm" variant="ghost">
                <Bell className="h-5 w-5" />
                <Badge className="-right-1 -top-1 absolute flex size-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="relative h-8 w-8 rounded-full"
                    variant="ghost"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        alt={user?.firstName || 'Admin'}
                        src={user?.profilePictureUrl || ''}
                      />
                      <AvatarFallback>{`${getFirstLetter(
                        user?.firstName || ''
                      )}${getFirstLetter(
                        user?.lastName || ''
                      )}`}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-sm leading-none">
                        Super Admin
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
