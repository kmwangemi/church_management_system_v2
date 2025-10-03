'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ADMIN_MEMBER_ROLE_OPTIONS, GENDER_OPTIONS } from '@/lib/utils';
import { adminDataSchema, type AdminPayload } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Edit,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordInput } from '../password-input';
import { PhoneInput } from '../phone-number-input';

interface Church {
  id: number;
  name: string;
}

interface ManageChurchUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: Church | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string;
  avatar: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const allPermissions: Permission[] = [
  {
    id: 'view_members',
    name: 'View Members',
    description: 'View member profiles and information',
    category: 'Members',
  },
  {
    id: 'add_members',
    name: 'Add Members',
    description: 'Add new members to the church',
    category: 'Members',
  },
  {
    id: 'edit_members',
    name: 'Edit Members',
    description: 'Edit existing member information',
    category: 'Members',
  },
  {
    id: 'delete_members',
    name: 'Delete Members',
    description: 'Remove members from the church',
    category: 'Members',
  },
  {
    id: 'view_finance',
    name: 'View Finance',
    description: 'View financial records and reports',
    category: 'Finance',
  },
  {
    id: 'manage_finance',
    name: 'Manage Finance',
    description: 'Add and edit financial transactions',
    category: 'Finance',
  },
  {
    id: 'view_events',
    name: 'View Events',
    description: 'View church events and calendar',
    category: 'Events',
  },
  {
    id: 'manage_events',
    name: 'Manage Events',
    description: 'Create and manage church events',
    category: 'Events',
  },
  {
    id: 'view_attendance',
    name: 'View Attendance',
    description: 'View attendance records',
    category: 'Attendance',
  },
  {
    id: 'manage_attendance',
    name: 'Manage Attendance',
    description: 'Mark and manage attendance',
    category: 'Attendance',
  },
  {
    id: 'send_messages',
    name: 'Send Messages',
    description: 'Send messages to members',
    category: 'Communication',
  },
  {
    id: 'manage_announcements',
    name: 'Manage Announcements',
    description: 'Create and manage announcements',
    category: 'Communication',
  },
  {
    id: 'view_content',
    name: 'View Content',
    description: 'View sermons and media',
    category: 'Content',
  },
  {
    id: 'manage_content',
    name: 'Manage Content',
    description: 'Upload and manage content',
    category: 'Content',
  },
  {
    id: 'view_reports',
    name: 'View Reports',
    description: 'View system reports',
    category: 'Reports',
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'Manage church settings',
    category: 'Settings',
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Add and manage system users',
    category: 'Users',
  },
];

export function ManageChurchUsersDialog({
  open,
  onOpenChange,
  church,
}: ManageChurchUsersDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Rev. John Smith',
      email: 'john.smith@church.org',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      lastLogin: '2 hours ago',
      avatar: '/placeholder.svg',
      permissions: [
        'view_members',
        'add_members',
        'edit_members',
        'delete_members',
        'view_finance',
        'manage_finance',
      ],
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@church.org',
      phone: '+1 (555) 234-5678',
      role: 'pastor',
      status: 'active',
      lastLogin: '1 day ago',
      avatar: '/placeholder.svg',
      permissions: [
        'view_members',
        'add_members',
        'edit_members',
        'view_events',
        'manage_events',
      ],
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@church.org',
      phone: '+1 (555) 345-6789',
      role: 'staff',
      status: 'active',
      lastLogin: '3 hours ago',
      avatar: '/placeholder.svg',
      permissions: [
        'view_members',
        'view_events',
        'view_attendance',
        'manage_attendance',
      ],
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@church.org',
      phone: '+1 (555) 456-7890',
      role: 'volunteer',
      status: 'pending',
      lastLogin: 'Never',
      avatar: '/placeholder.svg',
      permissions: ['view_members', 'view_events'],
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'pastor':
        return <Badge className="bg-purple-100 text-purple-800">Pastor</Badge>;
      case 'staff':
        return <Badge className="bg-blue-100 text-blue-800">Staff</Badge>;
      case 'volunteer':
        return <Badge className="bg-green-100 text-green-800">Volunteer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === 'active' ? 'suspended' : 'active',
            }
          : user
      )
    );
    alert('User status updated successfully!');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsDialogOpen(true);
  };

  if (!church) return null;

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manage Users - {church.name}
            </DialogTitle>
            <DialogDescription>
              Add, edit, or remove users and manage their permissions
            </DialogDescription>
          </DialogHeader>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Active</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {users.filter((u) => u.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {users.filter((u) => u.role === 'admin').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Pending</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {users.filter((u) => u.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Filters and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                value={searchTerm}
              />
            </div>
            <Select onValueChange={setRoleFilter} value={roleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setAddUserDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar || '/placeholder.svg'}
                          />
                          <AvatarFallback>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-8 w-8 p-0" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManagePermissions(user)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
            <Button>Export User List</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add User Dialog */}
      <AddUserDialog
        church={church}
        onOpenChange={setAddUserDialogOpen}
        open={addUserDialogOpen}
      />
      {/* Edit User Dialog */}
      <EditUserDialog
        onOpenChange={setEditUserDialogOpen}
        onSaveUser={(updatedUser) => {
          setUsers(
            users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          );
        }}
        open={editUserDialogOpen}
        user={selectedUser}
      />
      {/* Manage Permissions Dialog */}
      <ManagePermissionsDialog
        onOpenChange={setPermissionsDialogOpen}
        onSavePermissions={(userId, permissions) => {
          setUsers(
            users.map((u) => (u.id === userId ? { ...u, permissions } : u))
          );
        }}
        open={permissionsDialogOpen}
        user={selectedUser}
      />
    </>
  );
}

// Add User Dialog Component
interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: Church;
}

function AddUserDialog({ open, onOpenChange, church }: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<AdminPayload>({
    resolver: zodResolver(adminDataSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'male',
      isMember: true,
      password: '',
      confirmPassword: '',
      role: 'admin',
      // sendWelcomeEmail: true,
    },
  });
  // const {
  //   mutateAsync: registerChurchMutation,
  //   isPending,
  //   isError,
  //   error,
  // } = useRegisterChurch();
  // const { reset, watch, setValue } = form;

  const onSubmit = async (payload: AdminPayload) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('User added successfully!');
      onOpenChange(false);
    } catch (error) {
      alert('Error adding user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User to {church.name}</DialogTitle>
          <DialogDescription>
            Create a new user account with specific role and permissions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs className="w-full" defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent className="mt-4 space-y-4" value="basic">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user@church.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="KE"
                            onChange={field.onChange}
                            placeholder="Enter phone number"
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Gender <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[400px] overflow-y-auto">
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem
                                className="cursor-pointer"
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isMember"
                    render={({ field }) => (
                      <FormItem className="mt-4 flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Church Member</FormLabel>
                          <p className="text-gray-500 text-sm">
                            This person is also a church member
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Role <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {ADMIN_MEMBER_ROLE_OPTIONS.map((option) => (
                            <SelectItem
                              className="cursor-pointer"
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent className="mt-4 space-y-4" value="security">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Temporary Password{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Create a strong password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Confirm Password{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  User will be prompted to change this on first login
                </p>
                <FormField
                  control={form.control}
                  name="sendWelcomeEmail"
                  render={({ field }) => (
                    <FormItem className="mt-4 flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send Welcome Email</FormLabel>
                        <p className="text-gray-500 text-sm">
                          Send login credentials and welcome information to the
                          user
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">
                Administrator Account
              </h4>
              <p className="text-blue-700 text-sm">
                The admin will be set up as the primary administrator with full
                access to the church management system. They can add additional
                users and assign roles as needed.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog Component
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaveUser: (user: User) => void;
}

function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSaveUser,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: '',
  });

  // Update form when user changes
  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedUser: User = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
      };

      onSaveUser(updatedUser);
      alert('User updated successfully!');
      onOpenChange(false);
    } catch (error) {
      alert('Error updating user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and settings
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                required
                value={formData.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                required
                type="tel"
                value={formData.phone}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  value={formData.role}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Manage Permissions Dialog Component
interface ManagePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSavePermissions: (userId: number, permissions: string[]) => void;
}

function ManagePermissionsDialog({
  open,
  onOpenChange,
  user,
  onSavePermissions,
}: ManagePermissionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Update permissions when user changes
  useState(() => {
    if (user) {
      setSelectedPermissions(user.permissions);
    }
  });

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions = allPermissions
      .filter((p) => p.category === category)
      .map((p) => p.id);
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...categoryPermissions]),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onSavePermissions(user.id, selectedPermissions);
      alert('Permissions updated successfully!');
      onOpenChange(false);
    } catch (error) {
      alert('Error updating permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const categories = [...new Set(allPermissions.map((p) => p.category))];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions for {user.name}</DialogTitle>
          <DialogDescription>
            Select the permissions this user should have access to
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div>
                <p className="font-medium">Current Role: {user.role}</p>
                <p className="text-muted-foreground text-sm">
                  Selected {selectedPermissions.length} of{' '}
                  {allPermissions.length} permissions
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map((category) => {
              const categoryPermissions = allPermissions.filter(
                (p) => p.category === category
              );
              const allSelected = categoryPermissions.every((p) =>
                selectedPermissions.includes(p.id)
              );
              const someSelected =
                categoryPermissions.some((p) =>
                  selectedPermissions.includes(p.id)
                ) && !allSelected;

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{category}</CardTitle>
                      <Button
                        onClick={() => handleSelectAll(category)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {categoryPermissions.map((permission) => (
                        <div
                          className="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                          key={permission.id}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.id
                            )}
                            id={permission.id}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.id)
                            }
                          />
                          <div className="flex-1 space-y-1 leading-none">
                            <Label
                              className="cursor-pointer font-medium text-sm"
                              htmlFor={permission.id}
                            >
                              {permission.name}
                            </Label>
                            <p className="text-muted-foreground text-xs">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Permissions...
                </>
              ) : (
                'Save Permissions'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
