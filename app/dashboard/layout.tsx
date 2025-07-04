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
import { cn } from '@/lib/utils';
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
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null },
  { name: 'Members', href: '/dashboard/members', icon: Users, badge: null },
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

interface User {
  email: string;
  role: string;
  name: string;
  churchName?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
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
        'flex flex-col h-full bg-white',
        mobile ? 'w-full' : 'w-64',
      )}
    >
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center space-x-2'>
          <div className='bg-blue-600 p-1.5 rounded-lg'>
            <Church className='h-6 w-6 text-white' />
          </div>
          <span className='text-xl font-bold text-gray-900'>ChurchFlow</span>
        </div>
      </div>
      {/* User Info */}
      {user && (
        <div className='p-4 border-b bg-gray-50'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src='/placeholder.svg?height=40&width=40'
                alt={user.name}
              />
              <AvatarFallback className='bg-blue-100 text-blue-600'>
                {user.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {user.name}
              </p>
              <div className='flex items-center space-x-2'>
                <Badge
                  variant='secondary'
                  className={cn('text-xs', getRoleColor(user.role))}
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          {user.churchName && (
            <p className='text-xs text-gray-500 mt-2 truncate'>
              {user.churchName}
            </p>
          )}
        </div>
      )}
      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <div className='flex items-center space-x-3'>
                <item.icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-400',
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge
                  variant={item.badge === 'New' ? 'default' : 'secondary'}
                  className='text-xs h-5 px-1.5'
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className='p-4 border-t'>
        <div className='bg-blue-50 p-3 rounded-lg'>
          <div className='flex items-center space-x-2 mb-2'>
            <BookOpen className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-900'>
              Need Help?
            </span>
          </div>
          <p className='text-xs text-blue-700 mb-2'>
            Check our documentation and tutorials
          </p>
          <Button
            size='sm'
            variant='outline'
            className='w-full text-xs h-7 bg-transparent'
          >
            View Docs
          </Button>
        </div>
      </div>
    </div>
  );
  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }
  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Desktop Sidebar */}
      <div className='hidden lg:flex lg:flex-shrink-0'>
        <div className='flex flex-col w-64 border-r border-gray-200'>
          <Sidebar />
        </div>
      </div>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side='left' className='p-0 w-64'>
          <SheetTitle className='sr-only'>Dashboard Navigation Menu</SheetTitle>
          <SheetDescription className='sr-only'>
            Main navigation menu for the dashboard
          </SheetDescription>
          <Sidebar mobile />
        </SheetContent>
      </Sheet>
      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='sm' className='lg:hidden'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='p-0 w-64'>
                <SheetTitle className='sr-only'>
                  Dashboard Navigation Menu
                </SheetTitle>
                <SheetDescription className='sr-only'>
                  Main navigation menu for the dashboard
                </SheetDescription>
                <Sidebar mobile />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                {navigation.find(item => item.href === pathname)?.name ||
                  'Dashboard'}
              </h1>
              <p className='text-sm text-gray-500 hidden sm:block'>
                {user.churchName || 'Church Management System'}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src='/placeholder.svg?height=32&width=32'
                      alt={user.name}
                    />
                    <AvatarFallback className='bg-blue-100 text-blue-600'>
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {user.name}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shield className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className='mr-2 h-4 w-4' />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Main Content */}
        <main className='flex-1 overflow-auto p-6 bg-gray-50'>{children}</main>
      </div>
    </div>
  );
}
