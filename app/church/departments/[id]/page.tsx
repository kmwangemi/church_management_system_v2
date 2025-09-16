'use client';

import RenderApiError from '@/components/api-error';
import { DatePicker } from '@/components/date-picker';
import { AddDepartmentActivityForm } from '@/components/forms/add-department-activity-form';
import { AddDepartmentExpenseForm } from '@/components/forms/add-department-expense-form';
import { AddDepartmentGoalForm } from '@/components/forms/add-department-goal-form';
import { AddDepartmentMemberForm } from '@/components/forms/add-department-member-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import { MultiSelect } from '@/components/multi-select';
import { NumberInput } from '@/components/number-input';
import { TimeInput } from '@/components/time-input';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { UserCombobox } from '@/components/user-combobox';
import {
  useFetchDepartmentById,
  useFetchDepartmentMembers,
} from '@/lib/hooks/church/department/use-department-queries';
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
  DEPARTMENT_CATEGORY_OPTIONS,
  formatToNewDate,
  getFirstLetter,
  getRelativeYear,
  MEETING_DAY_OPTIONS,
} from '@/lib/utils';
import {
  type AddDepartmentPayload,
  addDepartmentSchema,
} from '@/lib/validations/department';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Target,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function DepartmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // 👈 unwrap the promise
  const [isEditing, setIsEditing] = useState(false);
  const [isAddDepartmentMemberDialogOpen, setIsAddDepartmentMemberDialogOpen] =
    useState(false);
  const [
    isAddDepartmentExpenseDialogOpen,
    setIsAddDepartmentExpenseDialogOpen,
  ] = useState(false);
  const [
    isAddDepartmentActivityDialogOpen,
    setIsAddDepartmentActivityDialogOpen,
  ] = useState(false);
  const [isAddDepartmentGoalDialogOpen, setIsAddDepartmentGoalDialogOpen] =
    useState(false);
  const {
    data: department,
    isLoading: isLoadingDepartment,
    isError: isErrorDepartment,
    error: errorDepartment,
  } = useFetchDepartmentById(id);
  const form = useForm<AddDepartmentPayload>({
    resolver: zodResolver(addDepartmentSchema),
    defaultValues: {
      departmentName: '',
      category: undefined,
      leaderId: undefined,
      location: '',
      establishedDate: '',
      totalBudget: '',
      meetingDay: [],
      meetingTime: [],
      description: '',
    },
  });
  useEffect(() => {
    if (department) {
      const formData: any = {
        departmentName: capitalizeFirstLetter(department?.departmentName || ''),
        category: department?.category || '',
        leaderId: department?.leaderId || '',
        location: capitalizeFirstLetter(department?.location || ''),
        totalBudget: department?.totalBudget || '',
        meetingDay: department?.meetingDay || [],
        meetingTime: department?.meetingTime || [],
        // Convert to YYYY-MM-DD format for input type="date"
        establishedDate: department?.establishedDate
          ? new Date(department.establishedDate).toISOString().split('T')[0]
          : '',
        description: department?.description || '',
      };
      form.reset(formData);
    }
  }, [form, department]);

  console.log('Fetched Department:', JSON.stringify(department));
  const {
    data: departmentMembers,
    isLoading: isLoadingDepartmentMembers,
    isError: isErrorDepartmentMembers,
    error: errorDepartmentMembers,
  } = useFetchDepartmentMembers({
    departmentId: id,
    page: 1,
    limit: 10,
    // search: '',
    // role: '',
    // isActive: true,
  });

  // // Mock department data - in real app, fetch based on params.id
  // const department = {
  //   id,
  //   name: 'Worship Ministry',
  //   head: {
  //     name: 'Sarah Wilson',
  //     id: 'staff-001',
  //     phone: '+1 (555) 123-4567',
  //     email: 'sarah.wilson@church.com',
  //     avatar: '/placeholder.svg?height=64&width=64',
  //     position: 'Worship Pastor',
  //     joinDate: '2020-01-15',
  //   },
  //   branch: 'Main Campus',
  //   branchId: 1,
  //   members: 15,
  //   budget: 25_000,
  //   budgetUsed: 18_500,
  //   status: 'Active',
  //   category: 'Ministry',
  //   description:
  //     'Leads worship services and music ministry across all services, coordinating with musicians, vocalists, and technical teams to create meaningful worship experiences.',
  //   established: '2020-01-15',
  //   meetingDay: 'Thursday',
  //   meetingTime: '7:00 PM',
  //   location: 'Music Room',
  //   goals: [
  //     'Expand worship team to 20 members',
  //     'Implement new sound system',
  //     'Launch contemporary service',
  //     'Train 5 new worship leaders',
  //   ],
  // };

  // const departmentMembers = [
  //   {
  //     id: 1,
  //     name: 'John Smith',
  //     role: 'Lead Guitarist',
  //     email: 'john.smith@email.com',
  //     phone: '+1 (555) 234-5678',
  //     joinDate: '2021-03-15',
  //     status: 'Active',
  //     skills: ['Guitar', 'Vocals', 'Music Theory'],
  //     avatar: '/placeholder.svg?height=32&width=32',
  //   },
  //   {
  //     id: 2,
  //     name: 'Emily Davis',
  //     role: 'Vocalist',
  //     email: 'emily.davis@email.com',
  //     phone: '+1 (555) 345-6789',
  //     joinDate: '2021-06-20',
  //     status: 'Active',
  //     skills: ['Vocals', 'Piano', 'Songwriting'],
  //     avatar: '/placeholder.svg?height=32&width=32',
  //   },
  //   {
  //     id: 3,
  //     name: 'Michael Brown',
  //     role: 'Drummer',
  //     email: 'michael.brown@email.com',
  //     phone: '+1 (555) 456-7890',
  //     joinDate: '2020-11-10',
  //     status: 'Active',
  //     skills: ['Drums', 'Percussion', 'Audio Engineering'],
  //     avatar: '/placeholder.svg?height=32&width=32',
  //   },
  //   {
  //     id: 4,
  //     name: 'Lisa Wilson',
  //     role: 'Keyboardist',
  //     email: 'lisa.wilson@email.com',
  //     phone: '+1 (555) 567-8901',
  //     joinDate: '2022-01-05',
  //     status: 'Active',
  //     skills: ['Piano', 'Keyboard', 'Music Arrangement'],
  //     avatar: '/placeholder.svg?height=32&width=32',
  //   },
  // ];

  const activities = [
    {
      id: 1,
      type: 'Meeting',
      title: 'Weekly Worship Team Practice',
      date: '2024-01-25',
      description: 'Regular practice session for Sunday service',
      participants: 12,
    },
    {
      id: 2,
      type: 'Event',
      title: 'Christmas Concert Preparation',
      date: '2024-01-22',
      description: 'Special rehearsal for Christmas concert',
      participants: 15,
    },
    {
      id: 3,
      type: 'Training',
      title: 'New Member Orientation',
      date: '2024-01-20',
      description: 'Training session for new worship team members',
      participants: 8,
    },
    {
      id: 4,
      type: 'Planning',
      title: 'Q1 Worship Planning Meeting',
      date: '2024-01-18',
      description: 'Planning worship themes and songs for Q1',
      participants: 6,
    },
  ];

  const budget = {
    allocated: 25_000,
    used: 18_500,
    remaining: 6500,
    categories: [
      { name: 'Equipment', allocated: 10_000, used: 8500 },
      { name: 'Training', allocated: 5000, used: 3000 },
      { name: 'Events', allocated: 7000, used: 5000 },
      { name: 'Materials', allocated: 3000, used: 2000 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/church/departments">
            <Button size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {capitalizeFirstLetterOfEachWord(
                department?.departmentName || 'Department Name'
              )}
            </h1>
            <p className="text-muted-foreground">
              Department details and management
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
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
      {/* Department Stats */}
      {isErrorDepartment && <RenderApiError error={errorDepartment} />}
      {isLoadingDepartment ? (
        <SpinnerLoader description="Loading department data..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {department?.members?.length}
                </div>
                <p className="text-muted-foreground text-xs">Active members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Budget Usage
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {/* {Math.round(
                    (department.budgetUsed / department.budget) * 100
                  )} */}
                  0 %
                </div>
                <p className="text-muted-foreground text-xs">
                  {/* KES {department.budgetUsed.toLocaleString()} used */}
                  KES 0 used
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Years Active
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">4</div>
                <p className="text-muted-foreground text-xs">
                  Since{' '}
                  {department?.establishedDate
                    ? formatToNewDate(new Date(department.establishedDate))
                    : 'Not Provided'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  Activities
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{activities.length}</div>
                <p className="text-muted-foreground text-xs">This month</p>
              </CardContent>
            </Card>
          </div>
          <Tabs className="space-y-4" defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
            <TabsContent className="space-y-6" value="overview">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Department Information</CardTitle>
                    <CardDescription>
                      Basic details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <Form {...form}>
                        <form className="space-y-4">
                          <FormField
                            control={form.control}
                            name="departmentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Department Name{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Choir" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Category{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="cursor-pointer">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[400px] overflow-y-auto">
                                    {DEPARTMENT_CATEGORY_OPTIONS.map(
                                      (option) => (
                                        <SelectItem
                                          className="cursor-pointer"
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="leaderId" // Form field stores just the user ID string
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Leader (Optional)</FormLabel>
                                <FormControl>
                                  <UserCombobox
                                    className="w-full"
                                    onValueChange={field.onChange} // Use onValueChange for ID
                                    placeholder="Search and select a leader"
                                    value={field.value} // Pass the ID directly
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="meetingDay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Meeting day(s){' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <MultiSelect
                                      onChange={field.onChange}
                                      options={MEETING_DAY_OPTIONS}
                                      placeholder="Select meeting day(s)"
                                      selected={field.value || []}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="meetingTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Meeting Time(s){' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <TimeInput
                                      multiSelect
                                      onChange={field.onChange}
                                      placeholder="Select meeting times"
                                      value={field.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="establishedDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Established Date{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <DatePicker
                                    format="long"
                                    maxDate={getRelativeYear(1)}
                                    minDate={getRelativeYear(-30)}
                                    onChange={(date) =>
                                      field.onChange(
                                        date ? date.toISOString() : ''
                                      )
                                    }
                                    placeholder="Select established date"
                                    value={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="totalBudget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Budget (KES){' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <NumberInput placeholder="1000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Location{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Main Sanctuary or Room 101"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel
                                  className="text-right"
                                  htmlFor="description"
                                >
                                  Description{' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="col-span-3"
                                    id="description"
                                    placeholder="Enter department description..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="col-span-3 col-start-2" />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Category:{' '}
                            {capitalizeFirstLetterOfEachWord(
                              department?.category || 'Not Provided'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {capitalizeFirstLetterOfEachWord(
                              department?.location || 'Not Provided'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {department?.meetingDay
                              ?.map(
                                (day) =>
                                  day.charAt(0).toUpperCase() + day.slice(1)
                              )
                              .join(', ')}{' '}
                            at {department?.meetingTime?.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Budget: KES{' '}
                            {department?.totalBudget.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Established:{' '}
                            {department?.establishedDate
                              ? new Date(
                                  department.establishedDate
                                ).toLocaleDateString()
                              : 'Not Provided'}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                {/* Department Head */}
                <Card>
                  <CardHeader>
                    <CardTitle>Department Head</CardTitle>
                    <CardDescription>
                      Leadership and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={
                            department?.leaderId?.profilePictureUrl ||
                            '/placeholder.svg'
                          }
                        />
                        <AvatarFallback>
                          {department?.leaderId?.firstName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {department?.leaderId?.firstName}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {department?.leaderId?.position}
                        </p>
                        <Badge variant="outline">{department?.status}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {department?.leaderId?.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {department?.leaderId?.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Leading since{' '}
                          {new Date(
                            department.leaderId?.joinDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                  <CardDescription>
                    Department mission and overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea defaultValue={department?.description} rows={4} />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {capitalizeFirstLetter(
                        department?.description || 'No description provided.'
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent className="space-y-6" value="members">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Department Members</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage department membership and roles
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsAddDepartmentMemberDialogOpen}
                  open={isAddDepartmentMemberDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Department Member</DialogTitle>
                      <DialogDescription>
                        Add a member to this department
                      </DialogDescription>
                    </DialogHeader>
                    <AddDepartmentMemberForm
                      departmentId={id}
                      onCloseDialog={() =>
                        setIsAddDepartmentMemberDialogOpen(false)
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentMembers?.data?.members?.map((member) => (
                        <TableRow key={member?._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  alt={member?.userId?.firstName || 'Member'}
                                  src={member?.userId?.profilePictureUrl || ''}
                                />
                                <AvatarFallback>{`${getFirstLetter(
                                  member?.userId?.firstName || ''
                                )}${getFirstLetter(member?.userId?.lastName || '')}`}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{`${capitalizeFirstLetter(
                                  member?.userId?.firstName || ''
                                )} ${capitalizeFirstLetter(member?.userId?.lastName || '')}`}</div>
                                <div className="text-muted-foreground text-sm">
                                  {member?.userId?.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {capitalizeFirstLetter(member?.role)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member?.skills.map((skill, index) => (
                                <Badge
                                  className="text-xs"
                                  key={index}
                                  variant="outline"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(member?.joinedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member?.isActive ? 'default' : 'secondary'
                              }
                            >
                              {member?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
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
            </TabsContent>
            <TabsContent className="space-y-6" value="budget">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Budget Management</h3>
                  <p className="text-muted-foreground text-sm">
                    Track department budget allocation and usage
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsAddDepartmentExpenseDialogOpen}
                  open={isAddDepartmentExpenseDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                      <DialogDescription>
                        Add an expense to this department
                      </DialogDescription>
                    </DialogHeader>
                    <AddDepartmentExpenseForm
                      departmentId={id}
                      onCloseDialog={() =>
                        setIsAddDepartmentExpenseDialogOpen(false)
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                    <CardDescription>
                      Annual budget allocation and usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Total Allocated
                        </span>
                        <span className="text-sm">
                          KES {budget.allocated.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Used</span>
                        <span className="text-sm">
                          KES {budget.used.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Remaining</span>
                        <span className="font-medium text-green-600 text-sm">
                          KES {budget.remaining.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        className="w-full"
                        value={(budget.used / budget.allocated) * 100}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Categories</CardTitle>
                    <CardDescription>
                      Breakdown by expense category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budget.categories.map((category, index) => (
                        <div className="space-y-2" key={index}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {category.name}
                            </span>
                            <span className="text-sm">
                              KES {category.used.toLocaleString()} /{' '}
                              {category.allocated.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            className="h-2 w-full"
                            value={(category.used / category.allocated) * 100}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent className="space-y-6" value="activities">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Department Activities</h3>
                  <p className="text-muted-foreground text-sm">
                    Recent meetings, events, and activities
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsAddDepartmentActivityDialogOpen}
                  open={isAddDepartmentActivityDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Log Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Log Activity</DialogTitle>
                      <DialogDescription>
                        Add an activity to this department
                      </DialogDescription>
                    </DialogHeader>
                    <AddDepartmentActivityForm
                      departmentId={id}
                      onCloseDialog={() =>
                        setIsAddDepartmentActivityDialogOpen(false)
                      }
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
                        <TableHead>Type</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {new Date(activity.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{activity.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {activity.title}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {activity.description}
                              </div>
                            </div>
                          </TableCell>
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
            <TabsContent className="space-y-6" value="goals">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Department Goals</h3>
                  <p className="text-muted-foreground text-sm">
                    Track progress on department objectives
                  </p>
                </div>
                <Dialog
                  onOpenChange={setIsAddDepartmentGoalDialogOpen}
                  open={isAddDepartmentGoalDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Goal</DialogTitle>
                      <DialogDescription>
                        Add a goal to this department
                      </DialogDescription>
                    </DialogHeader>
                    <AddDepartmentGoalForm
                      departmentId={id}
                      onCloseDialog={() =>
                        setIsAddDepartmentGoalDialogOpen(false)
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-4">
                {department?.goals.map((goal, index) => (
                  <Card key={index}>
                    <CardContent className="flex items-center space-x-4 p-4">
                      <div className="flex-shrink-0">
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{goal}</h4>
                        <div className="mt-2 flex items-center space-x-2">
                          <Progress
                            className="h-2 flex-1"
                            value={Math.random() * 100}
                          />
                          <span className="text-muted-foreground text-sm">
                            {Math.round(Math.random() * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
