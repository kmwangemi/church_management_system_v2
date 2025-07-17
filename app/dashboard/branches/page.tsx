'use client';

import RenderApiError from '@/components/ApiError';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import SearchInput from '@/components/search-input';
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
import {
  useFetchBranches,
  useRegisterBranch,
} from '@/lib/hooks/branch/use-branch-queries';
import { AddBranchPayload, addBranchSchema } from '@/lib/validations/branch';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  BarChart3,
  Building,
  Edit,
  MapPin,
  Phone,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data
// const branches = [
//   {
//     id: 1,
//     name: 'Main Campus',
//     location: '123 Church Street, Downtown',
//     pastor: 'Rev. John Smith',
//     phone: '(555) 123-4567',
//     email: 'main@church.org',
//     members: 450,
//     capacity: 600,
//     services: 3,
//     established: '1985',
//     status: 'Active',
//     growth: 12,
//   },
//   {
//     id: 2,
//     name: 'North Branch',
//     location: '456 Oak Avenue, Northside',
//     pastor: 'Rev. Sarah Johnson',
//     phone: '(555) 234-5678',
//     email: 'north@church.org',
//     members: 280,
//     capacity: 350,
//     services: 2,
//     established: '2010',
//     status: 'Active',
//     growth: 8,
//   },
//   {
//     id: 3,
//     name: 'South Campus',
//     location: '789 Pine Road, Southside',
//     pastor: 'Rev. Michael Brown',
//     phone: '(555) 345-6789',
//     email: 'south@church.org',
//     members: 320,
//     capacity: 400,
//     services: 2,
//     established: '2015',
//     status: 'Active',
//     growth: -3,
//   },
//   {
//     id: 4,
//     name: 'East Branch',
//     location: '321 Elm Street, Eastside',
//     pastor: 'Rev. Lisa Davis',
//     phone: '(555) 456-7890',
//     email: 'east@church.org',
//     members: 180,
//     capacity: 250,
//     services: 2,
//     established: '2020',
//     status: 'Growing',
//     growth: 25,
//   },
// ];

const attendanceData = [
  { month: 'Jan', main: 420, north: 260, south: 300, east: 150 },
  { month: 'Feb', main: 435, north: 270, south: 310, east: 160 },
  { month: 'Mar', main: 445, north: 275, south: 315, east: 170 },
  { month: 'Apr', main: 450, north: 280, south: 320, east: 180 },
];

const branchDistribution = [
  { name: 'Main Campus', value: 450, color: '#3b82f6' },
  { name: 'North Branch', value: 280, color: '#10b981' },
  { name: 'South Campus', value: 320, color: '#f59e0b' },
  { name: 'East Branch', value: 180, color: '#ef4444' },
];

export default function BranchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const page = Number.parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('query') || '';
  const {
    register,
    reset: resetSearchInput,
    handleSubmit,
  } = useForm({
    defaultValues: {
      query: searchQuery,
    },
  });
  const {
    data: branches,
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
    error: errorBranches,
  } = useFetchBranches(page, searchQuery);
  const {
    mutateAsync: registerBranchMutation,
    isPending: isPendingBranch,
    isError: isErrorBranch,
    error: errorBranch,
  } = useRegisterBranch();
  const branchForm = useForm<AddBranchPayload>({
    resolver: zodResolver(addBranchSchema),
    defaultValues: {
      branchName: '',
      country: '',
      capacity: '',
      address: '',
      // pastorId: '',
      establishedDate: '',
    },
  });
  const { reset: resetBranchForm } = branchForm;
  // Handle form submission
  const onSubmitBranchForm = async (payload: AddBranchPayload) => {
    await registerBranchMutation(payload);
    setIsDialogOpen(false);
    resetBranchForm();
  };
  const handleCancelBranch = () => {
    setIsDialogOpen(false);
    resetBranchForm();
  };
  const handleResetQueries = () => {
    resetSearchInput();
    router.push(pathname);
  };

  // const totalMembers = branches?.branches.reduce(
  //   (sum, branch) => sum + branch?.members,
  //   0,
  // );
  // const totalCapacity = branches?.branches.reduce(
  //   (sum, branch) => sum + branch?.capacity,
  //   0,
  // );
  // const averageGrowth =
  //   branches?.branches.reduce((sum, branch) => sum + branch?.growth, 0) / branches?.length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Church Branches</h1>
          <p className='text-gray-600 mt-1'>
            Manage and monitor all church locations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>
                Create a new church branch location
              </DialogDescription>
            </DialogHeader>
            {isErrorBranch && <RenderApiError error={errorBranch} />}
            <Form {...branchForm}>
              <form
                onSubmit={branchForm.handleSubmit(onSubmitBranchForm)}
                className='space-y-4'
              >
                <FormField
                  control={branchForm.control}
                  name='branchName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Branch Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Kibra' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={branchForm.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <CountrySelect
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Select country'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={branchForm.control}
                  name='capacity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Capacity <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        {/* <Input type='number' placeholder='300' {...field} /> */}
                        <Input
                          type='text'
                          inputMode='numeric'
                          placeholder='Enter capacity number'
                          {...field}
                          onChange={e => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              '',
                            );
                            field.onChange(value);
                          }}
                          onKeyDown={e => {
                            // Disable arrow keys
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              e.preventDefault();
                            }
                            // Allow only numbers, backspace, delete, etc.
                            const allowedKeys = [
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                            ];
                            if (
                              !allowedKeys.includes(e.key) &&
                              !/[0-9.]/.test(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={branchForm.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Physical Address <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Kawangware 46' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={branchForm.control}
                  name='establishedDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Established Date <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={date =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder='Select established date'
                          format='long'
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-end space-x-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancelBranch}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={!branchForm.formState.isValid || isPendingBranch}
                  >
                    {isPendingBranch ? 'Adding branch...' : 'Add Branch'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Analytics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Branches
            </CardTitle>
            <Building className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {branches?.branches.length}
            </div>
            <p className='text-xs text-muted-foreground'>Active locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {/* {totalMembers.toLocaleString()} */}
              {0}
            </div>
            <p className='text-xs text-muted-foreground'>Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Capacity Utilization
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {/* {Math.round((totalMembers / totalCapacity) * 100)}% */}
              {0}%
            </div>
            <p className='text-xs text-muted-foreground'>
              {/* {totalCapacity - totalMembers} seats available */}
              {0} seats available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Growth
            </CardTitle>
            {/* {averageGrowth >= 0 ? (
              <TrendingUp className='h-4 w-4 text-green-600' />
            ) : (
              <TrendingDown className='h-4 w-4 text-red-600' />
            )} */}
          </CardHeader>
          <CardContent>
            <div
              // className={`text-2xl font-bold ${
              //   averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              // }`}
              className='font-bold text-2xl text-green-600'
            >
              {/* {averageGrowth > 0 ? '+' : ''}
              {averageGrowth.toFixed(1)}% */}
              0
            </div>
            <p className='text-xs text-muted-foreground'>This quarter</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='management'>Management</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Branch Attendance Trends</CardTitle>
                <CardDescription>
                  Monthly attendance across all branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    main: { label: 'Main Campus', color: '#3b82f6' },
                    north: { label: 'North Branch', color: '#10b981' },
                    south: { label: 'South Campus', color: '#f59e0b' },
                    east: { label: 'East Branch', color: '#ef4444' },
                  }}
                  className='h-[300px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='month' />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type='monotone'
                        dataKey='main'
                        stroke='var(--color-main)'
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='north'
                        stroke='var(--color-north)'
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='south'
                        stroke='var(--color-south)'
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='east'
                        stroke='var(--color-east)'
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Member Distribution</CardTitle>
                <CardDescription>Members across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: 'Members' },
                  }}
                  className='h-[300px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={branchDistribution}
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {branchDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Growth rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    growth: { label: 'Growth Rate', color: '#3b82f6' },
                  }}
                  className='h-[300px]'
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={branches?.branches}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey='growth' fill='var(--color-growth)' />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Capacity Analysis</CardTitle>
                <CardDescription>Current vs maximum capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {branches?.branches?.map(branch => (
                    <div key={branch._id} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>{branch?.branchName}</span>
                        <span>
                          {branch?.members}/{branch?.capacity}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${
                              (branch?.members / branch?.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='management' className='space-y-6'>
          {/* Search and Filter */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='mb-4'>
              <SearchInput
                register={register}
                handleSubmit={handleSubmit}
                placeholder='Search branches...'
              />
            </div>
            {/* <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search branches...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div> */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-full sm:w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='growing'>Growing</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Branches Table */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Directory</CardTitle>
              <CardDescription>
                Manage all church branch locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Pastor</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches?.branches?.map(branch => (
                    <TableRow key={branch._id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{branch.branchName}</div>
                          <div className='text-sm text-gray-500 flex items-center'>
                            <MapPin className='h-3 w-3 mr-1' />
                            {branch.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{branch?.pastor}</div>
                          <div className='text-sm text-gray-500 flex items-center'>
                            <Phone className='h-3 w-3 mr-1' />
                            {branch?.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{branch?.members}</TableCell>
                      <TableCell>{branch?.capacity}</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center ${
                            branch.growth >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {branch.growth >= 0 ? (
                            <TrendingUp className='h-4 w-4 mr-1' />
                          ) : (
                            <TrendingDown className='h-4 w-4 mr-1' />
                          )}
                          {branch.growth > 0 ? '+' : ''}
                          {branch.growth}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            branch.status === 'Active' ? 'default' : 'secondary'
                          }
                        >
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button variant='ghost' size='sm'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <BarChart3 className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-red-600'
                          >
                            <Trash2 className='h-4 w-4' />
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
    </div>
  );
}
