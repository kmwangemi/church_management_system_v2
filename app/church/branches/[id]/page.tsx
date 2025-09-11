'use client';

import RenderApiError from '@/components/api-error';
import { CountrySelect } from '@/components/country-list-input';
import { DeleteUserDialog } from '@/components/dialogs/delete-user-dialog';
import { AddActivityForm } from '@/components/forms/add-activity-form';
import { AddAssetForm } from '@/components/forms/add-asset-form';
import { AddDepartmentForm } from '@/components/forms/add-department-form';
import { AddServiceScheduleForm } from '@/components/forms/add-service-schedule-form';
import { getRoleBadgeVariant, getRoleIcon } from '@/components/helpers';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import { PhoneInput } from '@/components/phone-number-input';
import ReusableSelect from '@/components/reusable-select';
import SearchInput from '@/components/search-input';
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { UserListInput } from '@/components/user-list-input';
import {
  useFetchBranchById,
  useFetchBranchDepartments,
  useFetchBranchMembers,
} from '@/lib/hooks/church/branch/use-branch-queries';
import { useFetchServiceSchedules } from '@/lib/hooks/church/service-schedule/use-service-schedule-queries';
import { useDeleteUserById } from '@/lib/hooks/church/user/use-user-queries';
import type { UserResponse } from '@/lib/types/user';
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
  formatToNewDate,
  getFirstLetter,
} from '@/lib/utils';
import {
  type UpdateBranchPayload,
  updateBranchSchema,
} from '@/lib/validations/branch';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  Car,
  CheckCircle,
  Coffee,
  Edit,
  Eye,
  Heart,
  Home,
  Mail,
  MapPin,
  MoreHorizontal,
  Music,
  Phone,
  Plus,
  Save,
  Trash2,
  UserPlus,
  Users,
  Wifi,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

// Mock data
const assets = [
  {
    id: 1,
    name: 'Church Bus #1',
    type: 'Vehicle',
    category: 'Transportation',
    value: 45_000,
    purchaseDate: '2022-03-15',
    condition: 'Good',
    location: 'Main Campus',
    status: 'Active',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    serialNumber: 'CB001-2022',
    warranty: '3 years',
  },
  {
    id: 2,
    name: 'Grace Christian School',
    type: 'Property',
    category: 'Education',
    value: 850_000,
    purchaseDate: '2018-08-01',
    condition: 'Excellent',
    location: 'Downtown Campus',
    status: 'Active',
    lastMaintenance: '2023-12-01',
    nextMaintenance: '2024-06-01',
    serialNumber: 'GCS-2018',
    warranty: 'N/A',
  },
  {
    id: 3,
    name: 'Sound System - Main Sanctuary',
    type: 'Equipment',
    category: 'Audio/Visual',
    value: 25_000,
    purchaseDate: '2023-01-10',
    condition: 'Excellent',
    location: 'Main Sanctuary',
    status: 'Active',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01',
    serialNumber: 'SS-MS-2023',
    warranty: '2 years',
  },
  {
    id: 4,
    name: 'Church Van #2',
    type: 'Vehicle',
    category: 'Transportation',
    value: 32_000,
    purchaseDate: '2021-11-20',
    condition: 'Fair',
    location: 'Main Campus',
    status: 'Maintenance',
    lastMaintenance: '2024-02-20',
    nextMaintenance: '2024-03-20',
    serialNumber: 'CV002-2021',
    warranty: 'Expired',
  },
  {
    id: 5,
    name: 'Fellowship Hall Tables',
    type: 'Furniture',
    category: 'Furniture',
    value: 8000,
    purchaseDate: '2020-05-15',
    condition: 'Good',
    location: 'Fellowship Hall',
    status: 'Active',
    lastMaintenance: '2023-11-01',
    nextMaintenance: '2024-11-01',
    serialNumber: 'FHT-2020',
    warranty: 'N/A',
  },
];

const getAssetIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'vehicle':
      return <Car className="h-5 w-5" />;
    case 'property':
      return <Building className="h-5 w-5" />;
    case 'equipment':
      return <Wrench className="h-5 w-5" />;
    default:
      return <Home className="h-5 w-5" />;
  }
};

const getConditionBadge = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'excellent':
      return (
        <Badge className="border-green-200 bg-green-100 text-green-800">
          Excellent
        </Badge>
      );
    case 'good':
      return (
        <Badge className="border-blue-200 bg-blue-100 text-blue-800">
          Good
        </Badge>
      );
    case 'fair':
      return (
        <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
          Fair
        </Badge>
      );
    case 'poor':
      return (
        <Badge className="border-red-200 bg-red-100 text-red-800">Poor</Badge>
      );
    default:
      return <Badge variant="secondary">{condition}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return (
        <Badge className="border-green-200 bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge className="border-orange-200 bg-orange-100 text-orange-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Maintenance
        </Badge>
      );
    case 'retired':
      return <Badge variant="secondary">Retired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function BranchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // 👈 unwrap the promise
  const [isEditing, setIsEditing] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isServiceScheduleDialogOpen, setIsServiceScheduleDialogOpen] =
    useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState('all');
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('query') || '';
  const selectedStatusQuery = searchParams.get('status') || 'all';
  const {
    data: branch,
    isLoading: isLoadingBranch,
    isError: isErrorBranch,
    error: errorBranch,
  } = useFetchBranchById(id);

  const form = useForm<UpdateBranchPayload>({
    resolver: zodResolver(updateBranchSchema),
    defaultValues: {
      branchName: '',
      email: '',
      phoneNumber: '',
      pastorId: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Kenya',
      },
      capacity: '',
      members: '',
      establishedDate: '',
      description: '',
      isActive: false,
    },
  });
  useEffect(() => {
    if (branch) {
      const formData: any = {
        branchName: capitalizeFirstLetter(branch?.branchName || ''),
        email: branch?.email || undefined, // undefined instead of empty string
        phoneNumber: branch?.phoneNumber || '',
        address: {
          street: branch?.address?.street
            ? capitalizeFirstLetter(branch.address.street)
            : undefined,
          city: branch?.address?.city
            ? capitalizeFirstLetter(branch.address.city)
            : undefined,
          state: branch?.address?.state
            ? capitalizeFirstLetter(branch.address.state)
            : undefined,
          zipCode: branch?.address?.zipCode || undefined,
          country: branch?.address?.country || undefined,
        },
        establishedDate: branch?.establishedDate || undefined,
        capacity: branch?.capacity || undefined,
        members: branch?.members || undefined,
        pastorId: branch?.pastorId?._id || undefined,
        description: branch?.description || undefined,
        isActive: branch?.isActive,
      };
      form.reset(formData);
    }
  }, [form, branch]);
  // // Mock branch data - in real app, fetch based on params.id
  // const branch = {
  //   id: params.id,
  //   name: 'Downtown Campus',
  //   address: '456 Church Street, Downtown, ST 12345',
  //   phone: '+1 (555) 234-5678',
  //   email: 'downtown@church.com',
  //   pastor: 'Rev. Michael Davis',
  //   established: '2015-08-15',
  //   capacity: 300,
  //   currentMembers: 245,
  //   status: 'Active',
  //   description:
  //     'Our downtown campus serves the urban community with contemporary worship and community outreach programs.',
  //   facilities: [
  //     'Sanctuary',
  //     'Fellowship Hall',
  //     "Children's Area",
  //     'Kitchen',
  //     'Parking',
  //     'Sound System',
  //     'WiFi',
  //   ],
  //   serviceSchedule: [
  //     {
  //       day: 'Sunday',
  //       time: '9:00 AM',
  //       service: 'Morning Worship',
  //       attendance: 180,
  //     },
  //     {
  //       day: 'Sunday',
  //       time: '11:00 AM',
  //       service: 'Contemporary Service',
  //       attendance: 220,
  //     },
  //     {
  //       day: 'Wednesday',
  //       time: '7:00 PM',
  //       service: 'Bible Study',
  //       attendance: 65,
  //     },
  //     {
  //       day: 'Friday',
  //       time: '7:00 PM',
  //       service: 'Youth Meeting',
  //       attendance: 45,
  //     },
  //   ],
  // };
  // const departments = [
  //   {
  //     id: 1,
  //     name: 'Worship Ministry',
  //     head: 'Sarah Wilson',
  //     members: 12,
  //     description: 'Leads worship services and music ministry',
  //     status: 'Active',
  //   },
  //   {
  //     id: 2,
  //     name: "Children's Ministry",
  //     head: 'Lisa Brown',
  //     members: 8,
  //     description: "Ministry focused on children's spiritual development",
  //     status: 'Active',
  //   },
  //   {
  //     id: 3,
  //     name: 'Youth Ministry',
  //     head: 'David Johnson',
  //     members: 6,
  //     description: 'Engaging teenagers in faith and community',
  //     status: 'Active',
  //   },
  //   {
  //     id: 4,
  //     name: 'Outreach Ministry',
  //     head: 'Maria Garcia',
  //     members: 15,
  //     description: 'Community outreach and evangelism programs',
  //     status: 'Active',
  //   },
  // ];
  const activities = [
    {
      date: '2024-12-20',
      activity: 'Christmas Service Planning',
      participants: 25,
    },
    { date: '2024-12-18', activity: 'Community Food Drive', participants: 40 },
    { date: '2024-12-15', activity: 'Youth Christmas Party', participants: 35 },
    {
      date: '2024-12-12',
      activity: 'Bible Study Leadership Training',
      participants: 12,
    },
  ];
  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'sanctuary':
        return <Building className="h-4 w-4" />;
      case 'fellowship hall':
        return <Users className="h-4 w-4" />;
      case "children's area":
        return <Heart className="h-4 w-4" />;
      case 'kitchen':
        return <Coffee className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'sound system':
        return <Music className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };
  const { register, handleSubmit } = useForm({
    defaultValues: {
      query: searchQuery,
    },
  });
  const PAGE_SIZE = 10;
  // Narrow selectedStatusQuery to only "active" | "inactive" | "suspended" | "pending" | undefined
  const statusFilter:
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'pending'
    | undefined =
    selectedStatusQuery === 'active' ||
    selectedStatusQuery === 'inactive' ||
    selectedStatusQuery === 'suspended' ||
    selectedStatusQuery === 'pending'
      ? selectedStatusQuery
      : undefined;
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = useFetchBranchMembers(id, page, searchQuery, statusFilter, PAGE_SIZE);
  const {
    data: departments,
    isLoading: isLoadingDepartments,
    isError: isErrorDepartments,
    error: errorDepartments,
  } = useFetchBranchDepartments(id);
  const {
    data: schedules,
    isLoading: isLoadingSchedules,
    isError: isErrorSchedules,
    error: errorSchedules,
  } = useFetchServiceSchedules({
    page: 1,
    limit: 10,
    search: '',
    day: '',
    type: '',
    branchId: id,
    status: 'active',
  });
  console.log('schedules--->', schedules);

  const {
    mutateAsync: deleteUserMutation,
    isPending: isPendingDeleteUser,
    isError: isErrorDeleteUser,
    error: errorDeleteUser,
  } = useDeleteUserById();
  // Filter users based on selected tab and status
  const filteredUsers = useMemo(() => {
    if (!users?.users) return [];
    let filtered = users.users;
    // Filter by tab
    if (selectedTab !== 'all') {
      switch (selectedTab) {
        case 'active':
          filtered = filtered.filter((user) => user.status === 'active');
          break;
        case 'inactive':
          filtered = filtered.filter((user) => user.status === 'inactive');
          break;
        case 'staff':
          filtered = filtered.filter((user) =>
            ['pastor', 'bishop', 'admin'].includes(user.role?.toLowerCase())
          );
          break;
        default:
          break;
      }
    }
    return filtered;
  }, [users?.users, selectedTab]);
  // Calculate stats
  const stats = useMemo(() => {
    const allUsers = users?.users || [];
    return {
      total: allUsers.length || 0,
      active: allUsers.filter((u) => u.status === 'active').length,
      inactive: allUsers.filter((u) => u.status === 'inactive').length,
      staff: allUsers.filter((u) =>
        ['pastor', 'bishop', 'admin'].includes(u.role?.toLowerCase())
      ).length,
    };
  }, [users]);
  const handleDeleteUser = async (userId: string) => {
    await deleteUserMutation(userId);
    setDeletingUser(null);
  };
  const openDeleteDialog = (user: UserResponse) => {
    setDeletingUser(user);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      {isErrorBranch && <RenderApiError error={errorBranch} />}
      {isLoadingBranch ? (
        <SpinnerLoader description="Loading branch data..." />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/church/branches">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Branches
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-3xl tracking-tight">
                  {branch?.branchName}
                </h1>
                <p className="text-muted-foreground">
                  Branch details and management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
          {/* Branch Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{branch?.members}</div>
                <p className="text-muted-foreground text-xs">
                  {Math.round((branch?.members / branch?.capacity) * 100)}%
                  capacity
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Departments
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {departments?.departments?.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  Active departments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Weekly Services
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {/* {branch.serviceSchedule.length} */}
                  {0}
                </div>
                <p className="text-muted-foreground text-xs">
                  Regular services
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Avg. Attendance
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {/* {Math.round(
                branch.serviceSchedule.reduce(
                  (sum, service) => sum + service.attendance,
                  0
                ) / branch.serviceSchedule.length
              )} */}
                  0
                </div>
                <p className="text-muted-foreground text-xs">Per service</p>
              </CardContent>
            </Card>
          </div>
          <Tabs className="space-y-4" defaultValue="overview">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            <TabsContent className="space-y-6" value="overview">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Information</CardTitle>
                    <CardDescription>
                      Basic details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="branchName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Branch Name{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Kawangware" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter email address"
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
                                Phone Number{' '}
                                <span className="text-red-500">*</span>
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
                        <FormField
                          control={form.control}
                          name="pastorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pastor</FormLabel>
                              <FormControl>
                                <UserListInput
                                  className="w-full"
                                  onChange={(member) => {
                                    setSelectedMember(member);
                                    field.onChange(member?._id || ''); // ✅ Store only the ID
                                  }}
                                  placeholder="Search and select a pastor"
                                  value={selectedMember} // ✅ Use state for display
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <MapPin className="h-5 w-5" />
                              <span>Address Information</span>
                            </CardTitle>
                            <CardDescription>
                              Branch address information
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name="address.country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Country{' '}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <CountrySelect
                                        onChange={field.onChange}
                                        placeholder="Select your country"
                                        value={field.value}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="address.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      City{' '}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nairobi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="address.street"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Street Address{' '}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="123 Main Street"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="address.zipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="00100" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {branch?.address?.street ?? 'Not Provided'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {branch?.phoneNumber ?? 'Not Provided'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {branch?.email ?? 'Not Provided'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Pastor:{' '}
                            {branch?.pastorId?.firstName ?? 'Not Provided'}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                {/* Branch Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Status</CardTitle>
                    <CardDescription>
                      Current status and capacity information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Status</span>
                      <Badge variant="default">
                        {branch?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Established</span>
                      <span className="text-muted-foreground text-sm">
                        {branch?.establishedDate
                          ? formatToNewDate(branch.establishedDate)
                          : 'Not Provided'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Capacity</span>
                        <span className="text-muted-foreground text-sm">
                          {branch?.members}/{branch?.capacity}
                        </span>
                      </div>
                      <Progress
                        className="w-full"
                        value={(branch?.members / branch?.capacity) * 100}
                      />
                    </div>
                    {isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          defaultValue={branch?.capacity}
                          id="capacity"
                          type="number"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                  <CardDescription>Branch mission and overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {branch?.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="space-y-6" value="members">
              {/* Search and Filter */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <SearchInput
                      handleSubmit={handleSubmit}
                      placeholder="Search users..."
                      register={register}
                    />
                    <ReusableSelect
                      // className="w-full sm:w-[200px]"
                      clearValue="all"
                      defaultValue="all"
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                        { value: 'suspended', label: 'Suspended' },
                        { value: 'pending', label: 'Pending' },
                      ]}
                      paramName="status"
                      placeholder="Filter by status"
                      // resetPagination={false}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs onValueChange={setSelectedTab} value={selectedTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                      <TabsTrigger value="active">
                        Active ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger value="inactive">
                        Inactive ({stats.inactive})
                      </TabsTrigger>
                      <TabsTrigger value="staff">
                        Staff ({stats.staff})
                      </TabsTrigger>
                    </TabsList>
                    {isErrorUsers && <RenderApiError error={errorUsers} />}
                    {isErrorDeleteUser && (
                      <RenderApiError error={errorDeleteUser} />
                    )}
                    {isLoadingUsers ? (
                      <SpinnerLoader description="Loading members..." />
                    ) : (
                      <TabsContent className="mt-6" value={selectedTab}>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers?.map((user) => (
                                <TableRow
                                  className="hover:bg-gray-50"
                                  key={user._id}
                                >
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage
                                          alt={user?.firstName || 'User'}
                                          src={user?.profilePictureUrl ?? ''}
                                        />
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                          {`${getFirstLetter(user?.firstName || '')}${getFirstLetter(user?.lastName || '')}`}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {`${capitalizeFirstLetter(user?.firstName || '')} ${capitalizeFirstLetter(user?.lastName || 'Not Provided')}`}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                          {user.email || 'Not Provided'}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                          {user.phoneNumber || 'Not Provided'}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-gray-900 text-sm">
                                      {capitalizeFirstLetter(
                                        user.gender || 'Not Provided'
                                      )}
                                    </span>
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
                                    <Badge
                                      variant={
                                        user.status === 'active'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {user.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-gray-900 text-sm">
                                      {formatToNewDate(user.createdAt)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          className="h-8 w-8 p-0"
                                          variant="ghost"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                          asChild
                                          className="cursor-pointer"
                                        >
                                          <Link
                                            href={`/church/users/${user._id}`}
                                          >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View User
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          asChild
                                          className="cursor-pointer"
                                        >
                                          <Link
                                            href={`/church/users/edit/${user._id}`}
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit User
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="cursor-pointer text-red-600"
                                          onClick={() => openDeleteDialog(user)}
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
                        {filteredUsers?.length === 0 && (
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
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="space-y-6" value="departments">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Departments</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage branch departments and leadership
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsDepartmentDialogOpen}
                  open={isDepartmentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>
                        Create a new department for this branch
                      </DialogDescription>
                    </DialogHeader>
                    <AddDepartmentForm
                      onCloseDialog={() => setIsDepartmentDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {isErrorDepartments && (
                <RenderApiError error={errorDepartments} />
              )}
              {isLoadingDepartments ? (
                <SpinnerLoader description="Loading departments..." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {departments?.departments?.map((dept) => (
                    <Card key={dept?._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {capitalizeFirstLetterOfEachWord(
                              dept?.departmentName
                            )}
                          </CardTitle>
                          <Badge
                            variant={dept?.isActive ? 'default' : 'secondary'}
                          >
                            {dept?.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription>{dept.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              Department Head
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {dept?.leaderId?.firstName
                                ? `${dept.leaderId.firstName} ${dept.leaderId.lastName}`
                                : 'Not Assigned'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Members</span>
                            <span className="text-muted-foreground text-sm">
                              {dept?.members || 0}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                          <Link href={`/church/departments/${dept._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-4 w-4" />
                              View Department
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {departments?.departments?.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No branch departments found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent className="space-y-6" value="schedule">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Service Schedule</h3>
                  <p className="text-muted-foreground text-sm">
                    Regular services and meeting times
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsServiceScheduleDialogOpen}
                  open={isServiceScheduleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Service Schedule</DialogTitle>
                      <DialogDescription>
                        Create a new service schedule for this branch
                      </DialogDescription>
                    </DialogHeader>
                    <AddServiceScheduleForm
                      onCloseDialog={() =>
                        setIsServiceScheduleDialogOpen(false)
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>
              {isErrorSchedules && <RenderApiError error={errorSchedules} />}
              {/* {isErrorDeleteUser && <RenderApiError error={errorDeleteUser} />} */}
              {isLoadingSchedules ? (
                <SpinnerLoader description="Loading service schedules..." />
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Avg. Attendance</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules?.schedules?.map((service) => (
                          <TableRow key={service?._id}>
                            <TableCell className="font-medium">
                              {capitalizeFirstLetter(service?.day)}
                            </TableCell>
                            <TableCell>
                              {capitalizeFirstLetterOfEachWord(
                                service?.service
                              )}
                            </TableCell>
                            <TableCell>{service.time}</TableCell>
                            <TableCell>{service?.formattedDuration}</TableCell>
                            <TableCell>
                              {capitalizeFirstLetter(service?.type)}
                            </TableCell>
                            <TableCell>
                              {service?.formattedAttendance}
                            </TableCell>
                            <TableCell>
                              {capitalizeFirstLetterOfEachWord(
                                service?.location ?? ''
                              ) || 'Not Provided'}
                            </TableCell>
                            <TableCell>
                              {service?.startDate
                                ? formatToNewDate(new Date(service.startDate))
                                : 'Not Provided'}
                            </TableCell>
                            <TableCell>
                              {service?.endDate
                                ? formatToNewDate(new Date(service.endDate))
                                : 'Not Provided'}
                            </TableCell>
                            <TableCell>
                              {capitalizeFirstLetter(service?.notes ?? '') ||
                                'Not Provided'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              {schedules?.schedules?.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No service schedules found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent className="space-y-6" value="facilities">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">
                    Facilities & Amenities
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Available facilities and resources
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsFacilityDialogOpen}
                  open={isFacilityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Facility
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Facility</DialogTitle>
                      <DialogDescription>
                        Create a new facility for this branch
                      </DialogDescription>
                    </DialogHeader>
                    <AddAssetForm
                      onCloseDialog={() => setIsFacilityDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow className="hover:bg-gray-50" key={asset.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="rounded-lg bg-gray-100 p-2">
                              {getAssetIcon(asset.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {asset.name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {asset.location}
                              </div>
                              <div className="text-gray-500 text-sm">
                                Serial: {asset.serialNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${asset.value.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getConditionBadge(asset.condition)}
                        </TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 text-sm">
                              {new Date(
                                asset.nextMaintenance
                              ).toLocaleDateString()}
                            </span>
                          </div>
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
                                Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Wrench className="mr-2 h-4 w-4" />
                                Maintenance History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {assets.length === 0 && (
                <div className="py-12 text-center">
                  <Building className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No assets found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent className="space-y-6" value="activities">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Recent Activities</h3>
                  <p className="text-muted-foreground text-sm">
                    Latest events and activities at this branch
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsActivityDialogOpen}
                  open={isActivityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Log Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Activity</DialogTitle>
                      <DialogDescription>
                        Create a new activity for this branch
                      </DialogDescription>
                    </DialogHeader>
                    <AddActivityForm
                      onCloseDialog={() => setIsActivityDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {activity.date}
                          </TableCell>
                          <TableCell>{activity.activity}</TableCell>
                          <TableCell>{activity.participants}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      {/* Delete User Dialog */}
      <DeleteUserDialog
        isDeleting={isPendingDeleteUser}
        onDelete={handleDeleteUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        open={!!deletingUser}
        user={deletingUser}
      />
    </div>
  );
}
