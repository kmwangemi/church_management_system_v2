'use client';

import {
  Crown,
  Download,
  Edit,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useState } from 'react';
import { AddMemberForm } from '@/components/forms/add-member-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const members = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    role: 'Member',
    status: 'Active',
    joinDate: '2023-01-15',
    department: 'Choir',
    avatar: '/placeholder.svg?height=40&width=40',
    address: '123 Main St, City, State',
    dateOfBirth: '1985-06-15',
    maritalStatus: 'Married',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    role: 'Volunteer',
    status: 'Active',
    joinDate: '2023-03-22',
    department: 'Ushering',
    avatar: '/placeholder.svg?height=40&width=40',
    address: '456 Oak Ave, City, State',
    dateOfBirth: '1990-09-22',
    maritalStatus: 'Single',
  },
  {
    id: 3,
    name: 'Pastor Michael Brown',
    email: 'pastor.mike@church.com',
    phone: '+1 (555) 345-6789',
    role: 'Pastor',
    status: 'Active',
    joinDate: '2020-06-01',
    department: 'Leadership',
    avatar: '/placeholder.svg?height=40&width=40',
    address: '789 Church St, City, State',
    dateOfBirth: '1975-12-10',
    maritalStatus: 'Married',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 456-7890',
    role: 'Member',
    status: 'Inactive',
    joinDate: '2022-11-10',
    department: 'Youth',
    avatar: '/placeholder.svg?height=40&width=40',
    address: '321 Pine St, City, State',
    dateOfBirth: '1995-03-18',
    maritalStatus: 'Single',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+1 (555) 567-8901',
    role: 'Admin',
    status: 'Active',
    joinDate: '2021-08-15',
    department: 'Administration',
    avatar: '/placeholder.svg?height=40&width=40',
    address: '654 Elm St, City, State',
    dateOfBirth: '1980-07-25',
    maritalStatus: 'Married',
  },
];

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'pastor':
    case 'bishop':
      return <Crown className="h-4 w-4" />;
    case 'admin':
      return <UserCheck className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case 'pastor':
    case 'bishop':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'volunteer':
      return 'outline';
    default:
      return 'secondary';
  }
};

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'active')
      return matchesSearch && member.status === 'Active';
    if (selectedTab === 'inactive')
      return matchesSearch && member.status === 'Inactive';
    if (selectedTab === 'staff')
      return (
        matchesSearch && (member.role === 'Pastor' || member.role === 'Admin')
      );
    return matchesSearch;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'Active').length,
    inactive: members.filter((m) => m.status === 'Inactive').length,
    staff: members.filter((m) => m.role === 'Pastor' || m.role === 'Admin')
      .length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Member Management
          </h1>
          <p className="mt-1 text-gray-600">
            Manage church members, roles, and information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new member to the church database
                </DialogDescription>
              </DialogHeader>
              <AddMemberForm onCloseDialog={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Total Members
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-gray-900">
              {stats.total}
            </div>
            <p className="mt-1 text-gray-500 text-xs">All registered members</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Active Members
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.active}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Currently active</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Inactive Members
            </CardTitle>
            <div className="rounded-lg bg-red-100 p-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {stats.inactive}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Need follow-up</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Staff Members
            </CardTitle>
            <div className="rounded-lg bg-purple-100 p-2">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">
              {stats.staff}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Leadership team</p>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members by name, email, or department..."
                value={searchTerm}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setSelectedTab} value={selectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({stats.inactive})
              </TabsTrigger>
              <TabsTrigger value="staff">Staff ({stats.staff})</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-6" value={selectedTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow className="hover:bg-gray-50" key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                alt={member.name}
                                src={member.avatar || '/placeholder.svg'}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {member.email}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {member.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="flex w-fit items-center gap-1"
                            variant={getRoleBadgeVariant(member.role)}
                          >
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 text-sm">
                            {member.department}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === 'Active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 text-sm">
                            {new Date(member.joinDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Call Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredMembers.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No members found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
