'use client';

import {
  Activity,
  BarChart3,
  Building,
  Edit,
  MapPin,
  // Phone,
  Plus,
  Trash2,
  // TrendingDown,
  // TrendingUp,
  Users,
} from 'lucide-react';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AddBranchForm } from '@/components/forms/add-branch-form';
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
import { useFetchBranches } from '@/lib/hooks/branch/use-branch-queries';
import { capitalizeFirstLetterOfEachWord } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
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
  // const router = useRouter();
  const searchParams = useSearchParams();
  // const pathname = usePathname();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    data: branches,
    // isLoading: isLoadingBranches,
    // isError: isErrorBranches,
    // error: errorBranches,
  } = useFetchBranches(page, searchQuery);

  // const handleResetQueries = () => {
  //   resetSearchInput();
  //   router.push(pathname);
  // };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Church Branches</h1>
          <p className="mt-1 text-gray-600">
            Manage and monitor all church locations
          </p>
        </div>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Create a new church branch</DialogDescription>
            </DialogHeader>
            <AddBranchForm onCloseDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Branches
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {branches?.branches.length}
            </div>
            <p className="text-muted-foreground text-xs">Active locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {/* {totalMembers.toLocaleString()} */}
              {0}
            </div>
            <p className="text-muted-foreground text-xs">Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Capacity Utilization
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {/* {Math.round((totalMembers / totalCapacity) * 100)}% */}
              {0}%
            </div>
            <p className="text-muted-foreground text-xs">
              {/* {totalCapacity - totalMembers} seats available */}
              {0} seats available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
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
              className="font-bold text-2xl text-green-600"
            >
              {/* {averageGrowth > 0 ? '+' : ''}
              {averageGrowth.toFixed(1)}% */}
              0
            </div>
            <p className="text-muted-foreground text-xs">This quarter</p>
          </CardContent>
        </Card>
      </div>
      <Tabs className="space-y-6" defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-6" value="overview">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Branch Attendance Trends</CardTitle>
                <CardDescription>
                  Monthly attendance across all branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    main: { label: 'Main Campus', color: '#3b82f6' },
                    north: { label: 'North Branch', color: '#10b981' },
                    south: { label: 'South Campus', color: '#f59e0b' },
                    east: { label: 'East Branch', color: '#ef4444' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        dataKey="main"
                        stroke="var(--color-main)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="north"
                        stroke="var(--color-north)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="south"
                        stroke="var(--color-south)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="east"
                        stroke="var(--color-east)"
                        strokeWidth={2}
                        type="monotone"
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
                  className="h-[300px]"
                  config={{
                    value: { label: 'Members' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={branchDistribution}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                      >
                        {branchDistribution.map((entry, index) => (
                          <Cell fill={entry.color} key={`cell-${index}`} />
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
        <TabsContent className="space-y-6" value="analytics">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Growth rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    growth: { label: 'Growth Rate', color: '#3b82f6' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={branches?.branches}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="growth" fill="var(--color-growth)" />
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
                {/* <div className="space-y-4">
                  {branches?.branches?.map((branch) => (
                    <div className="space-y-2" key={branch._id}>
                      <div className="flex justify-between text-sm">
                        <span>{branch?.branchName}</span>
                        <span>
                          {branch?.members}/{branch?.capacity}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${
                              (branch?.members / branch?.capacity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div> */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent className="space-y-6" value="management">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <SearchInput
              handleSubmit={handleSubmit}
              placeholder="Search branches..."
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
                    {/* <TableHead>Pastor</TableHead> */}
                    {/* <TableHead>Members</TableHead> */}
                    <TableHead>Capacity</TableHead>
                    {/* <TableHead>Growth</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches?.branches?.map((branch) => (
                    <TableRow key={branch._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {capitalizeFirstLetterOfEachWord(branch.branchName)}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="mr-1 h-3 w-3" />
                            {capitalizeFirstLetterOfEachWord(branch.address)}
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <div>
                          <div className="font-medium">{branch?.pastor}</div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {branch?.phone}
                          </div>
                        </div>
                      </TableCell> */}
                      {/* <TableCell>{branch?.members}</TableCell> */}
                      <TableCell>{branch?.capacity}</TableCell>
                      {/* <TableCell>
                        <div
                          className={`flex items-center ${
                            branch.growth >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {branch.growth >= 0 ? (
                            <TrendingUp className="mr-1 h-4 w-4" />
                          ) : (
                            <TrendingDown className="mr-1 h-4 w-4" />
                          )}
                          {branch.growth > 0 ? '+' : ''}
                          {branch.growth}%
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <Badge
                          variant={branch?.isActive ? 'default' : 'secondary'}
                        >
                          {branch?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            className="text-red-600"
                            size="sm"
                            variant="ghost"
                          >
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
      </Tabs>
    </div>
  );
}
