'use client';

import { AddSmallGroupForm } from '@/components/forms/add-small-group-form';
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
  Baby,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Coffee,
  Edit,
  Gamepad2,
  Heart,
  MapPin,
  Music,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredGroups = smallGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      group.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDay =
      selectedDay === 'all' ||
      group.meetingDay.toLowerCase() === selectedDay.toLowerCase();
    return matchesSearch && matchesCategory && matchesDay;
  });

  const totalMembers = smallGroups.reduce(
    (sum, group) => sum + group.members,
    0
  );
  const totalCapacity = smallGroups.reduce(
    (sum, group) => sum + group.capacity,
    0
  );
  const averageGrowth =
    smallGroups.reduce((sum, group) => sum + group.growth, 0) /
    smallGroups.length;
  const activeGroups = smallGroups.filter(
    (group) => group.status === 'Active'
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
            <div className="font-bold text-2xl">{smallGroups.length}</div>
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
              Average Growth
            </CardTitle>
            {averageGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`font-bold text-2xl ${averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {averageGrowth > 0 ? '+' : ''}
              {averageGrowth.toFixed(1)}%
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
                <CardTitle>Group Performance</CardTitle>
                <CardDescription>Growth rates by group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smallGroups.slice(0, 5).map((group) => (
                    <div
                      className="flex items-center justify-between"
                      key={group.id}
                    >
                      <div className="flex items-center space-x-3">
                        <group.icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-sm">
                          {group.name}
                        </span>
                      </div>
                      <div
                        className={`flex items-center ${group.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {group.growth >= 0 ? (
                          <TrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                          <TrendingDown className="mr-1 h-4 w-4" />
                        )}
                        <span className="font-medium text-sm">
                          {group.growth > 0 ? '+' : ''}
                          {group.growth}%
                        </span>
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
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search groups..."
                value={searchTerm}
              />
            </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="rounded-lg bg-blue-100 p-1.5">
                            <group.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-gray-500 text-sm">
                              {group.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.leader}</div>
                          {group.coLeader && (
                            <div className="text-gray-500 text-sm">
                              Co-leader: {group.coLeader}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{group.meetingDay}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>{group.meetingTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{group.location}</span>
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
                        <div
                          className={`flex items-center ${group.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {group.growth >= 0 ? (
                            <TrendingUp className="mr-1 h-4 w-4" />
                          ) : (
                            <TrendingDown className="mr-1 h-4 w-4" />
                          )}
                          {group.growth > 0 ? '+' : ''}
                          {group.growth}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            group.status === 'Active' ? 'default' : 'secondary'
                          }
                        >
                          {group.status}
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
