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
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Church,
  DollarSign,
  Gift,
  Headphones,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/member', icon: Home, badge: null },
  { name: 'My Profile', href: '/member/profile', icon: User, badge: null },
  { name: 'My Giving', href: '/member/giving', icon: DollarSign, badge: null },
  { name: 'Events', href: '/member/events', icon: Calendar, badge: '3' },
  {
    name: 'Announcements',
    href: '/member/announcements',
    icon: MessageSquare,
    badge: '2',
  },
  {
    name: 'Prayer Requests',
    href: '/member/prayer',
    icon: Headphones,
    badge: null,
  },
  { name: 'Small Groups', href: '/member/groups', icon: Users, badge: null },
  {
    name: 'My Analytics',
    href: '/member/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    name: 'Spiritual Journey',
    href: '/member/journey',
    icon: Heart,
    badge: null,
  },
  { name: 'Settings', href: '/member/settings', icon: Settings, badge: null },
];

interface Member {
  id: string;
  email: string;
  name: string;
  churchName: string;
  membershipDate: string;
  phone?: string;
  avatar?: string;
  membershipStatus: 'Active' | 'Inactive' | 'New';
  smallGroups: string[];
}

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    // Mock member data - in real app, fetch from API
    const memberData = {
      id: 'member-123',
      email: 'john.doe@email.com',
      name: 'John Doe',
      churchName: 'Grace Community Church',
      membershipDate: '2020-03-15',
      phone: '+1 (555) 123-4567',
      membershipStatus: 'Active' as const,
      smallGroups: ['Young Adults', 'Bible Study Group'],
    };
    setMember(memberData);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('member');
    router.push('/auth/login');
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
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
          <span className='text-xl font-bold text-gray-900'>Member Portal</span>
        </div>
      </div>
      {/* Member Info */}
      {member && (
        <div className='p-4 border-b bg-gray-50'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src='/placeholder.svg?height=48&width=48'
                alt={member.name}
              />
              <AvatarFallback className='bg-blue-100 text-blue-600'>
                {member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {member.name}
              </p>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    getStatusColor(member.membershipStatus),
                  )}
                >
                  {member.membershipStatus}
                </Badge>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Member since {new Date(member.membershipDate).getFullYear()}
              </p>
            </div>
          </div>
          <p className='text-xs text-gray-600 mt-2 truncate'>
            {member.churchName}
          </p>
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
                  variant='secondary'
                  className='text-xs h-5 px-1.5 bg-red-100 text-red-800'
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
            <Gift className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-900'>
              Quick Give
            </span>
          </div>
          <p className='text-xs text-blue-700 mb-2'>
            Make a quick contribution
          </p>
          <Button
            size='sm'
            variant='outline'
            className='w-full text-xs h-7 bg-transparent'
          >
            Give Now
          </Button>
        </div>
      </div>
    </div>
  );
  if (!member) {
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
          <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
          <SheetDescription className='sr-only'>
            Main navigation menu for the member portal
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
                <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
                <SheetDescription className='sr-only'>
                  Main navigation menu for the member portal
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
                {member.churchName}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <Button variant='ghost' size='sm' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                5
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
                      alt={member.name}
                    />
                    <AvatarFallback className='bg-blue-100 text-blue-600'>
                      {member.name
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
                      {member.name}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {member.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className='mr-2 h-4 w-4' />
                  <span>My Profile</span>
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
