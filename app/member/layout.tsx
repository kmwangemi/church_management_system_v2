'use client';

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
        'flex h-full flex-col bg-white',
        mobile ? 'w-full' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-blue-600 p-1.5">
            <Church className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl">Member Portal</span>
        </div>
      </div>
      {/* Member Info */}
      {member && (
        <div className="border-b bg-gray-50 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                alt={member.name}
                src="/placeholder.svg?height=48&width=48"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 text-sm">
                {member.name}
              </p>
              <div className="mt-1 flex items-center space-x-2">
                <Badge
                  className={cn(
                    'text-xs',
                    getStatusColor(member.membershipStatus)
                  )}
                  variant="secondary"
                >
                  {member.membershipStatus}
                </Badge>
              </div>
              <p className="mt-1 text-gray-500 text-xs">
                Member since {new Date(member.membershipDate).getFullYear()}
              </p>
            </div>
          </div>
          <p className="mt-2 truncate text-gray-600 text-xs">
            {member.churchName}
          </p>
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
                  className="h-5 bg-red-100 px-1.5 text-red-800 text-xs"
                  variant="secondary"
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
            <Gift className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">
              Quick Give
            </span>
          </div>
          <p className="mb-2 text-blue-700 text-xs">
            Make a quick contribution
          </p>
          <Button
            className="h-7 w-full bg-transparent text-xs"
            size="sm"
            variant="outline"
          >
            Give Now
          </Button>
        </div>
      </div>
    </div>
  );
  if (!member) {
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
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation menu for the member portal
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
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu for the member portal
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
                {member.churchName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="relative" size="sm" variant="ghost">
              <Bell className="h-5 w-5" />
              <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                5
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
                      alt={member.name}
                      src="/placeholder.svg?height=32&width=32"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {member.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {member.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
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
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
