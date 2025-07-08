'use client';

import { AddChurchForm } from '@/components/forms/add-church-form';
import { useAuthProvider } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRole } from '@/lib/use-role';
import {
  Building2,
  DollarSign,
  Edit,
  Eye,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export default function ChurchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const churches = [
    {
      id: 1,
      name: 'Grace Community Church',
      pastor: 'Rev. John Smith',
      email: 'admin@gracecommunity.org',
      phone: '+1 (555) 123-4567',
      website: 'www.gracecommunity.org',
      denomination: 'Non-denominational',
      members: 2450,
      branches: 3,
      revenue: 45000,
      growth: 15.2,
      status: 'active',
      plan: 'premium',
      established: '1985',
      lastActivity: '2 hours ago',
      address: '123 Faith Street, Springfield, IL 62701',
    },
    {
      id: 2,
      name: 'Faith Baptist Church',
      pastor: 'Rev. Sarah Johnson',
      email: 'contact@faithbaptist.org',
      phone: '+1 (555) 234-5678',
      website: 'www.faithbaptist.org',
      denomination: 'Baptist',
      members: 1890,
      branches: 2,
      revenue: 38500,
      growth: 12.8,
      status: 'active',
      plan: 'standard',
      established: '1978',
      lastActivity: '1 hour ago',
      address: '456 Hope Avenue, Springfield, IL 62702',
    },
    {
      id: 3,
      name: 'Hope Methodist Church',
      pastor: 'Rev. Michael Brown',
      email: 'info@hopemethodist.org',
      phone: '+1 (555) 345-6789',
      website: 'www.hopemethodist.org',
      denomination: 'Methodist',
      members: 1650,
      branches: 1,
      revenue: 32000,
      growth: 10.5,
      status: 'active',
      plan: 'standard',
      established: '1992',
      lastActivity: '3 hours ago',
      address: '789 Grace Boulevard, Springfield, IL 62703',
    },
    {
      id: 4,
      name: 'Trinity Presbyterian',
      pastor: 'Rev. David Wilson',
      email: 'admin@trinitypresby.org',
      phone: '+1 (555) 456-7890',
      website: 'www.trinitypresby.org',
      denomination: 'Presbyterian',
      members: 1420,
      branches: 2,
      revenue: 28750,
      growth: 8.9,
      status: 'active',
      plan: 'premium',
      established: '1965',
      lastActivity: '5 hours ago',
      address: '321 Peace Lane, Springfield, IL 62704',
    },
    {
      id: 5,
      name: 'New Life Assembly',
      pastor: 'Rev. Lisa Davis',
      email: 'contact@newlifeassembly.org',
      phone: '+1 (555) 567-8901',
      website: 'www.newlifeassembly.org',
      denomination: 'Pentecostal',
      members: 1380,
      branches: 1,
      revenue: 27200,
      growth: 7.6,
      status: 'pending',
      plan: 'basic',
      established: '2001',
      lastActivity: '1 day ago',
      address: '654 Spirit Way, Springfield, IL 62705',
    },
  ];

  const filteredChurches = churches.filter(church => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.pastor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.denomination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || church.status === statusFilter;
    const matchesPlan = planFilter === 'all' || church.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'suspended':
        return <Badge className='bg-red-100 text-red-800'>Suspended</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className='bg-purple-100 text-purple-800'>Premium</Badge>;
      case 'standard':
        return <Badge className='bg-blue-100 text-blue-800'>Standard</Badge>;
      case 'basic':
        return <Badge className='bg-gray-100 text-gray-800'>Basic</Badge>;
      default:
        return <Badge variant='secondary'>{plan}</Badge>;
    }
  };

  const { isSuperAdmin, isAdmin, hasRole } = useRole();

  const { user, isLoading, isAuthenticated } = useAuthProvider();

  console.log({ isSuperAdmin, isAdmin, hasRole });

  console.log({ user, isLoading, isAuthenticated });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Churches Management
          </h1>
          <p className='text-muted-foreground'>
            Manage all registered churches and their information
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Church
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogTitle>Add Church</DialogTitle>
            <AddChurchForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Churches
            </CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{churches.length}</div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+2</span> new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {churches
                .reduce((sum, church) => sum + church.members, 0)
                .toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Branches
            </CardTitle>
            <MapPin className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {churches.reduce((sum, church) => sum + church.branches, 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+3</span> new branches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Revenue
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              $
              {churches
                .reduce((sum, church) => sum + church.revenue, 0)
                .toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              <span className='text-green-600'>+15%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Church Directory</CardTitle>
          <CardDescription>
            Complete list of all registered churches with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search churches, pastors, or denominations...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by plan' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Plans</SelectItem>
                <SelectItem value='premium'>Premium</SelectItem>
                <SelectItem value='standard'>Standard</SelectItem>
                <SelectItem value='basic'>Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church</TableHead>
                  <TableHead>Pastor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChurches.map(church => (
                  <TableRow key={church.id}>
                    <TableCell>
                      <div className='flex items-center space-x-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40`}
                          />
                          <AvatarFallback>
                            {church.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{church.name}</div>
                          <div className='text-sm text-muted-foreground'>
                            {church.denomination} • Est. {church.established}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{church.pastor}</div>
                        <div className='text-sm text-muted-foreground'>
                          Lead Pastor
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='flex items-center text-sm'>
                          <Mail className='mr-1 h-3 w-3' />
                          {church.email}
                        </div>
                        <div className='flex items-center text-sm'>
                          <Phone className='mr-1 h-3 w-3' />
                          {church.phone}
                        </div>
                        <div className='flex items-center text-sm'>
                          <Globe className='mr-1 h-3 w-3' />
                          {church.website}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <Users className='mr-1 h-4 w-4 text-muted-foreground' />
                        {church.members.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <MapPin className='mr-1 h-4 w-4 text-muted-foreground' />
                        {church.branches}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <DollarSign className='mr-1 h-4 w-4 text-muted-foreground' />
                        ${church.revenue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center text-green-600'>
                        <TrendingUp className='mr-1 h-4 w-4' />+{church.growth}%
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(church.status)}</TableCell>
                    <TableCell>{getPlanBadge(church.plan)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className='mr-2 h-4 w-4' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Church
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className='mr-2 h-4 w-4' />
                            Manage Users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className='text-red-600'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Suspend Church
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
