'use client';

import { AddSmallGroupForm } from '@/components/forms/add-small-group-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
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
import { useFetchGroups } from '@/lib/hooks/church/group/use-group-queries';
import { capitalizeFirstLetter } from '@/lib/utils';
import {
  Activity,
  Baby,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  Eye,
  Gamepad2,
  Heart,
  MapPin,
  MoreHorizontal,
  Music,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
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
const smallGroups = [
  {
    id: 1,
    name: 'Young Adults Bible Study',
    leader: 'Sarah Johnson',
    coLeader: 'Mike Davis',
    category: 'Bible Study',
    members: 12,
    capacity: 15,
    meetingDay: 'Wednesday',
    meetingTime: '7:00 PM',
    location: 'Room 201',
    description: 'Deep dive into scripture for young adults',
    status: 'Active',
    growth: 20,
    established: '2023',
    icon: BookOpen,
  },
  {
    id: 2,
    name: 'Marriage Enrichment',
    leader: 'John & Mary Smith',
    coLeader: 'David Wilson',
    category: 'Marriage',
    members: 8,
    capacity: 10,
    meetingDay: 'Friday',
    meetingTime: '7:30 PM',
    location: 'Fellowship Hall',
    description: 'Strengthening marriages through biblical principles',
    status: 'Active',
    growth: 14,
    established: '2022',
    icon: Heart,
  },
  {
    id: 3,
    name: "Men's Fellowship",
    leader: 'Robert Taylor',
    coLeader: 'James Brown',
    category: 'Fellowship',
    members: 15,
    capacity: 20,
    meetingDay: 'Saturday',
    meetingTime: '8:00 AM',
    location: 'Coffee Shop',
    description: 'Men gathering for fellowship and accountability',
    status: 'Active',
    growth: 7,
    established: '2021',
    icon: Coffee,
  },
  {
    id: 4,
    name: "Women's Prayer Circle",
    leader: 'Lisa Davis',
    coLeader: 'Jennifer Lee',
    category: 'Prayer',
    members: 18,
    capacity: 25,
    meetingDay: 'Tuesday',
    meetingTime: '10:00 AM',
    location: 'Prayer Room',
    description: 'Women united in prayer and support',
    status: 'Active',
    growth: 12,
    established: '2020',
    icon: Heart,
  },
  {
    id: 5,
    name: 'Youth Discipleship',
    leader: 'Michael Brown',
    coLeader: 'Sarah Wilson',
    category: 'Youth',
    members: 22,
    capacity: 30,
    meetingDay: 'Sunday',
    meetingTime: '6:00 PM',
    location: 'Youth Center',
    description: 'Discipling teenagers in their faith journey',
    status: 'Growing',
    growth: 35,
    established: '2023',
    icon: Gamepad2,
  },
  {
    id: 6,
    name: "Children's Ministry Team",
    leader: 'Amanda Johnson',
    coLeader: 'Tom Davis',
    category: 'Children',
    members: 10,
    capacity: 12,
    meetingDay: 'Thursday',
    meetingTime: '6:30 PM',
    location: "Children's Room",
    description: "Planning and coordinating children's activities",
    status: 'Active',
    growth: -5,
    established: '2022',
    icon: Baby,
  },
  {
    id: 7,
    name: 'Worship Team',
    leader: 'Daniel Lee',
    coLeader: 'Grace Kim',
    category: 'Worship',
    members: 14,
    capacity: 16,
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    location: 'Sanctuary',
    description: 'Musicians and vocalists serving in worship',
    status: 'Active',
    growth: 8,
    established: '2021',
    icon: Music,
  },
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

const attendanceData = [
  { month: 'Jan', total: 95, active: 88, new: 7 },
  { month: 'Feb', total: 102, active: 92, new: 10 },
  { month: 'Mar', total: 108, active: 96, new: 12 },
  { month: 'Apr', total: 115, active: 99, new: 16 },
];

const categoryDistribution = [
  { name: 'Bible Study', value: 12, color: '#3b82f6' },
  { name: 'Youth', value: 22, color: '#10b981' },
  { name: 'Prayer', value: 18, color: '#f59e0b' },
  { name: 'Fellowship', value: 15, color: '#ef4444' },
  { name: 'Worship', value: 14, color: '#8b5cf6' },
  { name: 'Children', value: 10, color: '#06b6d4' },
  { name: 'Marriage', value: 8, color: '#84cc16' },
];

const meetingDays = [
  { day: 'Sunday', groups: 1 },
  { day: 'Monday', groups: 0 },
  { day: 'Tuesday', groups: 1 },
  { day: 'Wednesday', groups: 1 },
  { day: 'Thursday', groups: 2 },
  { day: 'Friday', groups: 1 },
  { day: 'Saturday', groups: 1 },
];

export default function SmallGroupsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
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
    data: smallGroups,
    isLoading: isLoadingSmallGroups,
    isError: isErrorSmallGroups,
    error: errorSmallGroups,
  } = useFetchGroups(page, searchQuery);

  const totalMembers = 0;

  const totalCapacity = smallGroups?.groups.reduce(
    (sum, group) => sum + group?.capacity,
    0
  );

  const activeGroups = smallGroups?.groups.filter(
    (group) => group?.isActive
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Small Groups</h1>
          <p className="mt-1 text-gray-600">
            Manage and monitor small group ministries
          </p>
        </div>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Small Group</DialogTitle>
              <DialogDescription>
                Create a new small group ministry
              </DialogDescription>
            </DialogHeader>
            <AddSmallGroupForm onCloseDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {smallGroups?.groups.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {activeGroups} active groups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalMembers}</div>
            <p className="text-muted-foreground text-xs">Across all groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Capacity Utilization
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {Math.round((totalMembers / totalCapacity) * 100)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {totalCapacity - totalMembers} spots available
            </p>
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
            <div className="font-bold text-2xl">{0}</div>
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
                <CardTitle>Group Attendance Trends</CardTitle>
                <CardDescription>
                  Monthly attendance across all groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    total: { label: 'Total', color: '#3b82f6' },
                    active: { label: 'Active Members', color: '#10b981' },
                    new: { label: 'New Members', color: '#f59e0b' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        dataKey="total"
                        stroke="var(--color-total)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="active"
                        stroke="var(--color-active)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="new"
                        stroke="var(--color-new)"
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
                <CardTitle>Group Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
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
                        data={categoryDistribution}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                      >
                        {categoryDistribution.map((entry, index) => (
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
                <CardTitle>Meeting Schedule</CardTitle>
                <CardDescription>Groups by meeting day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    groups: { label: 'Groups', color: '#3b82f6' },
                  }}
                >
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={meetingDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="groups" fill="var(--color-groups)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Group Activities</CardTitle>
                <CardDescription>Monthly activities by group</CardDescription>
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
          </div>
        </TabsContent>
        <TabsContent className="space-y-6" value="management">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <SearchInput
              handleSubmit={handleSubmit}
              placeholder="Search groups..."
              register={register}
            />
            <Select
              onValueChange={setSelectedCategory}
              value={selectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bible study">Bible Study</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="marriage">Marriage</SelectItem>
                <SelectItem value="worship">Worship</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedDay} value={selectedDay}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Groups Table */}
          <Card>
            <CardHeader>
              <CardTitle>Small Groups Directory</CardTitle>
              <CardDescription>
                Manage all small group ministries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSmallGroups ? (
                <SpinnerLoader description="Loading groups..." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smallGroups?.groups?.map((group) => (
                      <TableRow key={group._id}>
                        <TableCell>
                          <div className="flex flex-col items-start">
                            <div className="font-medium">
                              {capitalizeFirstLetter(group?.groupName ?? '')}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {capitalizeFirstLetter(group?.category ?? '')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {group?.leaderId?.firstName
                                ? `${capitalizeFirstLetter(group.leaderId.firstName)} ${capitalizeFirstLetter(group.leaderId.lastName)}`
                                : 'Not Assigned'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {group?.meetingDay
                                ?.map(
                                  (day) =>
                                    day.charAt(0).toUpperCase() + day.slice(1)
                                )
                                .join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>{group?.meetingTime?.join(', ')}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {capitalizeFirstLetter(group?.location)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{group.members}</span>
                            <span className="text-gray-500">
                              /{group.capacity}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full bg-blue-600"
                              style={{
                                width: `${(group.members / group.capacity) * 100}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={group.isActive ? 'default' : 'secondary'}
                          >
                            {group.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-start">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                              >
                                <Link href={`/church/groups/${group?._id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Group
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {/* <DropdownMenuItem
                              className="cursor-pointer text-red-600"
                              onClick={() => openDeleteDialog(group)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Group
                            </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {smallGroups?.groups?.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No groups found
                  </h3>
                  <p className="text-gray-500">
                    Couldn’t find any groups. Try adjusting your filters or add
                    a new department.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
