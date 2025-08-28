'use client';

import { AddUserForm } from '@/components/forms/add-user-form';
import SearchInput from '@/components/search-input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFetchUsers } from '@/lib/hooks/user/use-user-queries';
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
  getFirstLetter,
} from '@/lib/utils';
import {
  Crown,
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Mock data
// const users = [
//   {
//     id: 1,
//     name: 'John Smith',
//     email: 'john.smith@email.com',
//     phone: '+1 (555) 123-4567',
//     role: 'User',
//     status: 'Active',
//     joinDate: '2023-01-15',
//     department: 'Choir',
//     avatar: '/placeholder.svg?height=40&width=40',
//     address: '123 Main St, City, State',
//     dateOfBirth: '1985-06-15',
//     maritalStatus: 'Married',
//   },
//   {
//     id: 2,
//     name: 'Sarah Johnson',
//     email: 'sarah.j@email.com',
//     phone: '+1 (555) 234-5678',
//     role: 'Volunteer',
//     status: 'Active',
//     joinDate: '2023-03-22',
//     department: 'Ushering',
//     avatar: '/placeholder.svg?height=40&width=40',
//     address: '456 Oak Ave, City, State',
//     dateOfBirth: '1990-09-22',
//     maritalStatus: 'Single',
//   },
//   {
//     id: 3,
//     name: 'Pastor Michael Brown',
//     email: 'pastor.mike@church.com',
//     phone: '+1 (555) 345-6789',
//     role: 'Pastor',
//     status: 'Active',
//     joinDate: '2020-06-01',
//     department: 'Leadership',
//     avatar: '/placeholder.svg?height=40&width=40',
//     address: '789 Church St, City, State',
//     dateOfBirth: '1975-12-10',
//     maritalStatus: 'Married',
//   },
//   {
//     id: 4,
//     name: 'Emily Davis',
//     email: 'emily.davis@email.com',
//     phone: '+1 (555) 456-7890',
//     role: 'User',
//     status: 'Inactive',
//     joinDate: '2022-11-10',
//     department: 'Youth',
//     avatar: '/placeholder.svg?height=40&width=40',
//     address: '321 Pine St, City, State',
//     dateOfBirth: '1995-03-18',
//     maritalStatus: 'Single',
//   },
//   {
//     id: 5,
//     name: 'David Wilson',
//     email: 'david.w@email.com',
//     phone: '+1 (555) 567-8901',
//     role: 'Admin',
//     status: 'Active',
//     joinDate: '2021-08-15',
//     department: 'Administration',
//     avatar: '/placeholder.svg?height=40&width=40',
//     address: '654 Elm St, City, State',
//     dateOfBirth: '1980-07-25',
//     maritalStatus: 'Married',
//   },
// ];

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

export default function UsersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('query') || '';
  const {
    register,
    // reset: resetSearchInput,
    handleSubmit,
  } = useForm({
    defaultValues: {
      query: searchQuery,
    },
  });

  const {
    data: users,
    // isLoading: isLoadingUsers,
    // isError: isErrorUsers,
    // error: errorUsers,
  } = useFetchUsers(page, searchQuery);

  // const filteredUsers = users.filter((user) => {
  //   const matchesSearch =
  //     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.department.toLowerCase().includes(searchTerm.toLowerCase());
  //   if (selectedTab === 'all') return matchesSearch;
  //   if (selectedTab === 'active')
  //     return matchesSearch && user.status === 'Active';
  //   if (selectedTab === 'inactive')
  //     return matchesSearch && user.status === 'Inactive';
  //   if (selectedTab === 'staff')
  //     return matchesSearch && (user.role === 'Pastor' || user.role === 'Admin');
  //   return matchesSearch;
  // });

  // const stats = {
  //   total: users.length,
  //   active: users.filter((m) => m.status === 'Active').length,
  //   inactive: users.filter((m) => m.status === 'Inactive').length,
  //   staff: users.filter((m) => m.role === 'Pastor' || m.role === 'Admin')
  //     .length,
  // };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">
            Manage church users, roles, and information
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
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the church database
                </DialogDescription>
              </DialogHeader>
              <AddUserForm onCloseDialog={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Total Users
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-gray-900">
              {/* {stats.total} */}
              {0}
            </div>
            <p className="mt-1 text-gray-500 text-xs">All registered users</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Active Users
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {/* {stats.active} */}
              {0}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Currently active</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Inactive Users
            </CardTitle>
            <div className="rounded-lg bg-red-100 p-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {/* {stats.inactive} */}
              {0}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Need follow-up</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Staff Users
            </CardTitle>
            <div className="rounded-lg bg-purple-100 p-2">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">
              {/* {stats.staff} */}
              {0}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Leadership team</p>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <SearchInput
              handleSubmit={handleSubmit}
              placeholder="Search users..."
              register={register}
            />
            <Select onValueChange={setSelectedStatus} value={selectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setSelectedTab} value={selectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              {/* <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({stats.inactive})
              </TabsTrigger>
              <TabsTrigger value="staff">Staff ({stats.staff})</TabsTrigger> */}
              <TabsTrigger value="all">All ({0})</TabsTrigger>
              <TabsTrigger value="active">Active ({0})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({0})</TabsTrigger>
              <TabsTrigger value="staff">Staff ({0})</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-6" value={selectedTab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.users.map((user) => (
                      <TableRow className="hover:bg-gray-50" key={user._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                alt={user?.firstName || 'User'}
                                src={user?.profilePictureUrl ?? ''}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600">{`${getFirstLetter(
                                user?.firstName || ''
                              )}${getFirstLetter(user?.lastName || '')}`}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {`${capitalizeFirstLetter(
                                  user?.firstName || 'N/A'
                                )} ${capitalizeFirstLetter(user?.lastName || 'N/A')}`}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {user.email || 'N/A'}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {user.phoneNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="flex w-fit items-center gap-1"
                            variant={getRoleBadgeVariant(user.role)}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 text-sm">
                            {capitalizeFirstLetterOfEachWord(
                              user.branchId?.branchName || 'N/A'
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'default' : 'secondary'}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user._id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View User
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/send-email/${user._id}`}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                // onClick={() => handleRemoveUser(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {users?.users?.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No users found
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
