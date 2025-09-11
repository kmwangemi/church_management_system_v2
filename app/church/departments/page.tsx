'use client';

import SearchInput from '@/components/search-input';
import {
  Activity,
  DollarSign,
  Eye,
  Plus,
  Trash2,
  // TrendingDown,
  // TrendingUp,
  Users,
} from 'lucide-react';
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
// import { Badge } from '@/components/ui/badge';
import { AddDepartmentForm } from '@/components/forms/add-department-form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFetchDepartments } from '@/lib/hooks/church/department/use-department-queries';
import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
} from '@/lib/utils';
import Link from 'next/link';

// Mock data
// const departments = [
//   {
//     id: 1,
//     name: 'Worship & Music',
//     head: 'Sarah Johnson',
//     members: 25,
//     budget: 15_000,
//     activities: 12,
//     established: '2020',
//     status: 'Active',
//     growth: 15,
//     icon: Music,
//     description: 'Leading worship services and music ministry',
//   },
//   {
//     id: 2,
//     name: "Children's Ministry",
//     head: 'Michael Brown',
//     members: 18,
//     budget: 8000,
//     activities: 8,
//     established: '2018',
//     status: 'Active',
//     growth: 22,
//     icon: Baby,
//     description: "Nurturing children's spiritual growth",
//   },
//   {
//     id: 3,
//     name: 'Youth Ministry',
//     head: 'Lisa Davis',
//     members: 15,
//     budget: 12_000,
//     activities: 15,
//     established: '2019',
//     status: 'Active',
//     growth: 8,
//     icon: Gamepad2,
//     description: 'Engaging teenagers in faith and community',
//   },
//   {
//     id: 4,
//     name: 'Outreach & Missions',
//     head: 'David Wilson',
//     members: 22,
//     budget: 20_000,
//     activities: 6,
//     established: '2017',
//     status: 'Active',
//     growth: 5,
//     icon: Heart,
//     description: 'Serving the community and global missions',
//   },
//   {
//     id: 5,
//     name: 'Adult Education',
//     head: 'Jennifer Lee',
//     members: 12,
//     budget: 5000,
//     activities: 10,
//     established: '2021',
//     status: 'Growing',
//     growth: 30,
//     icon: BookOpen,
//     description: 'Bible studies and adult learning programs',
//   },
//   {
//     id: 6,
//     name: 'Prayer Ministry',
//     head: 'Robert Taylor',
//     members: 20,
//     budget: 3000,
//     activities: 4,
//     established: '2016',
//     status: 'Active',
//     growth: -2,
//     icon: Headphones,
//     description: 'Coordinating prayer requests and intercession',
//   },
// ];

const departmentBudgets = [
  { name: 'Worship', budget: 15_000, spent: 12_000 },
  { name: 'Children', budget: 8000, spent: 6500 },
  { name: 'Youth', budget: 12_000, spent: 9800 },
  { name: 'Outreach', budget: 20_000, spent: 18_500 },
  { name: 'Education', budget: 5000, spent: 3200 },
  { name: 'Prayer', budget: 3000, spent: 2100 },
];

const activityData = [
  {
    month: 'Jan',
    worship: 10,
    children: 6,
    youth: 12,
    outreach: 4,
    education: 8,
    prayer: 3,
  },
  {
    month: 'Feb',
    worship: 11,
    children: 7,
    youth: 13,
    outreach: 5,
    education: 9,
    prayer: 4,
  },
  {
    month: 'Mar',
    worship: 12,
    children: 8,
    youth: 15,
    outreach: 6,
    education: 10,
    prayer: 4,
  },
  {
    month: 'Apr',
    worship: 12,
    children: 8,
    youth: 15,
    outreach: 6,
    education: 10,
    prayer: 4,
  },
];

const memberDistribution = [
  { name: 'Worship & Music', value: 25, color: '#3b82f6' },
  { name: 'Outreach & Missions', value: 22, color: '#10b981' },
  { name: 'Prayer Ministry', value: 20, color: '#f59e0b' },
  { name: "Children's Ministry", value: 18, color: '#ef4444' },
  { name: 'Youth Ministry', value: 15, color: '#8b5cf6' },
  { name: 'Adult Education', value: 12, color: '#06b6d4' },
];

export default function DepartmentsPage() {
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
    data: departments,
    // isLoading: isLoadingDepartments,
    // isError: isErrorDepartments,
    // error: errorDepartments,
  } = useFetchDepartments(page, searchQuery);

  // const handleResetQueries = () => {
  //   resetSearchInput();
  //   router.push(pathname);
  // };
  // const handleOpenDepartmentDialog = () => {
  //   setIsDialogOpen(true);
  //   handleResetQueries();
  // };
  // const totalMembers = departments.reduce((sum, dept) => sum + dept.members, 0);
  const totalMembers = 0;
  // const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalBudget = 0;
  // const totalActivities = departments.reduce(
  //   (sum, dept) => sum + dept.activities,
  //   0,
  // );
  const totalActivities = 0;
  // const averageGrowth =
  //   departments.reduce((sum, dept) => sum + dept.growth, 0) /
  //   departments.length;
  // const averageGrowth = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Departments</h1>
          <p className="mt-1 text-gray-600">
            Manage church departments and ministries
          </p>
        </div>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new ministry department
              </DialogDescription>
            </DialogHeader>
            <AddDepartmentForm onCloseDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Departments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {departments?.departments.length}
            </div>
            <p className="text-muted-foreground text-xs">Active ministries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalMembers}</div>
            <p className="text-muted-foreground text-xs">
              Across all departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Annual allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Monthly Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalActivities}</div>
            <p className="text-muted-foreground text-xs">This month</p>
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
                <CardTitle>Department Activities</CardTitle>
                <CardDescription>
                  Monthly activities by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    worship: { label: 'Worship', color: '#3b82f6' },
                    children: { label: 'Children', color: '#10b981' },
                    youth: { label: 'Youth', color: '#f59e0b' },
                    outreach: { label: 'Outreach', color: '#ef4444' },
                    education: { label: 'Education', color: '#8b5cf6' },
                    prayer: { label: 'Prayer', color: '#06b6d4' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        dataKey="worship"
                        stroke="var(--color-worship)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="children"
                        stroke="var(--color-children)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="youth"
                        stroke="var(--color-youth)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="outreach"
                        stroke="var(--color-outreach)"
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
                <CardDescription>Members across departments</CardDescription>
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
                        data={memberDistribution}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name.split(' ')[0]} ${(
                            (percent ?? 0) * 100
                          ).toFixed(0)}%`
                        }
                        outerRadius={80}
                      >
                        {memberDistribution.map((entry, index) => (
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
                <CardTitle>Budget Analysis</CardTitle>
                <CardDescription>
                  Budget vs spending by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    budget: { label: 'Budget', color: '#3b82f6' },
                    spent: { label: 'Spent', color: '#10b981' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={departmentBudgets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="budget" fill="var(--color-budget)" />
                      <Bar dataKey="spent" fill="var(--color-spent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Growth Analysis</CardTitle>
                <CardDescription>Department growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments?.departments.map((dept) => (
                    <div
                      className="flex items-center justify-between"
                      key={dept._id}
                    >
                      <div className="flex items-center space-x-3">
                        {/* <dept.icon className='h-5 w-5 text-gray-500' /> */}
                        <span className="font-medium">
                          {dept?.departmentName}
                        </span>
                      </div>
                      <div
                      // className={`flex items-center ${
                      //   dept?.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      // }`}
                      >
                        {/* {dept?.growth >= 0 ? (
                          <TrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                          <TrendingDown className="mr-1 h-4 w-4" />
                        )}
                        {dept?.growth > 0 ? '+' : ''}
                        {dept?.growth}% */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent className="space-y-6" value="management">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <SearchInput
              handleSubmit={handleSubmit}
              placeholder="Search departments..."
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
          {/* Departments Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments?.departments.map((dept) => (
              <Card key={dept?._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {capitalizeFirstLetterOfEachWord(dept.departmentName)}
                    </CardTitle>
                    <Badge variant={dept?.isActive ? 'default' : 'secondary'}>
                      {dept?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {capitalizeFirstLetter(dept?.description)}
                  </CardDescription>
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
                    <Link href={`/dashboard/departments/${dept._id}`}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
