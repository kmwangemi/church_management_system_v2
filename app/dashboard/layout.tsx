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
import { useAuthContext } from '@/contexts/auth-context';
import { capitalizeFirstLetter, cn, getFirstLetter } from '@/lib/utils';
import {
  BarChart3,
  Bell,
  BookOpen,
  Building,
  Calendar,
  Church,
  DollarSign,
  FileText,
  Headphones,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null },
  { name: 'Users', href: '/dashboard/users', icon: Users, badge: null },
  {
    name: 'Branches',
    href: '/dashboard/branches',
    icon: Building,
    badge: null,
  },
  {
    name: 'Departments',
    href: '/dashboard/departments',
    icon: Users,
    badge: null,
  },
  { name: 'Small Groups', href: '/dashboard/groups', icon: Users, badge: null },
  {
    name: 'Attendance',
    href: '/dashboard/attendance',
    icon: UserCheck,
    badge: 'New',
  },
  { name: 'Events', href: '/dashboard/events', icon: Calendar, badge: null },
  {
    name: 'Finance',
    href: '/dashboard/finance',
    icon: DollarSign,
    badge: null,
  },
  { name: 'Assets', href: '/dashboard/assets', icon: Building, badge: null },
  {
    name: 'Communication',
    href: '/dashboard/communication',
    icon: MessageSquare,
    badge: '3',
  },
  {
    name: 'Discipleship',
    href: '/dashboard/discipleship',
    icon: Heart,
    badge: null,
  },
  {
    name: 'Prayer Requests',
    href: '/dashboard/prayer',
    icon: Headphones,
    badge: '5',
  },
  { name: 'Content', href: '/dashboard/content', icon: FileText, badge: null },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, badge: null },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    badge: null,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuthContext();
  // const { user, isLoading, isAuthenticated, isError, logout } =
  //   useAuthContext();
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setIsLoggingOut(false);
  };
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'pastor':
      case 'bishop':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'finance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={cn(
        'flex h-full flex-col bg-white',
        mobile ? 'w-full' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-blue-600 p-1.5">
            <Church className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl">ChurchHub</span>
        </div>
      </div>
      {/* User Info */}
      {user && (
        <div className="border-b bg-gray-50 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                alt={user?.firstName || 'Admin'}
                src={user?.profilePictureUrl || ''}
              />
              <AvatarFallback>{`${getFirstLetter(
                user?.firstName || ''
              )}${getFirstLetter(user?.lastName || '')}`}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 text-sm">
                {user.name}
              </p>
              <div className="flex items-center space-x-2">
                <Badge
                  className={cn('text-xs', getRoleColor(user.role))}
                  variant="secondary"
                >
                  {capitalizeFirstLetter(user.role)}
                </Badge>
              </div>
            </div>
          </div>
          {'churchName' in user && (user as any).churchName && (
            <p className="mt-2 truncate text-gray-500 text-xs">
              {(user as any).churchName}
            </p>
          )}
        </div>
      )}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200',
                isActive
                  ? 'border border-blue-200 bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              href={item.href}
              key={item.name}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge
                  className="h-5 px-1.5 text-xs"
                  variant={item.badge === 'New' ? 'default' : 'secondary'}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="mb-2 flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">
              Need Help?
            </span>
          </div>
          <p className="mb-2 text-blue-700 text-xs">
            Check our documentation and tutorials
          </p>
          <Button
            className="h-7 w-full bg-transparent text-xs"
            size="sm"
            variant="outline"
          >
            View Docs
          </Button>
        </div>
      </div>
    </div>
  );
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
          <Sidebar />
        </div>
      </div>
      {/* Mobile Sidebar */}
      <Sheet onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <SheetContent className="w-64 p-0" side="left">
          <SheetTitle className="sr-only">Dashboard Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the dashboard
          </SheetDescription>
          <Sidebar mobile />
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
                <Sidebar mobile />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-semibold text-gray-900 text-xl">
                {navigation.find((item) => item.href === pathname)?.name ||
                  'Dashboard'}
              </h1>
              <p className="hidden text-gray-500 text-sm sm:block">
                {'churchName' in user && (user as any).churchName
                  ? (user as any).churchName
                  : 'Church Management System'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="relative" size="sm" variant="ghost">
              <Bell className="h-5 w-5" />
              <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                3
              </span>
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
                    )}${getFirstLetter(user?.lastName || '')}`}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {capitalizeFirstLetter(user.role)}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
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
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
