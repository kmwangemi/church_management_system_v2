'use client';

import RenderApiError from '@/components/api-error';
import { DeleteGoalDialog } from '@/components/dialogs/delete-goals-dialog';
import { AddGroupGoalForm } from '@/components/forms/add-group-goal-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  useDeleteGroupGoal,
  useFetchGroupGoals,
} from '@/lib/hooks/church/group/use-group-queries';
import type { GroupGoal } from '@/lib/types/small-group';
import { capitalizeFirstLetter } from '@/lib/utils';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

// Mock data for group details
const groupDetails = {
  id: 1,
  name: 'Young Adults Fellowship',
  leader: {
    name: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@email.com',
    joinDate: '2022-03-15',
    avatar: '/placeholder.svg?height=64&width=64',
  },
  description:
    "A vibrant community for young adults aged 18-30 focused on building meaningful relationships, studying God's word, and serving our community together.",
  members: 24,
  maxCapacity: 30,
  meetingDay: 'Wednesday',
  meetingTime: '7:00 PM',
  location: 'Room A - Main Building',
  category: 'Age Group',
  status: 'Active',
  startDate: '2022-01-10',
  averageAttendance: 85,
  goals: [
    'Increase membership to 30 by end of year',
    'Complete community service project',
    'Host monthly social events',
  ],
};

const groupMembers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 234-5678',
    joinDate: '2023-01-15',
    attendance: 92,
    role: 'Member',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 345-6789',
    joinDate: '2023-02-20',
    attendance: 88,
    role: 'Assistant Leader',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1 (555) 456-7890',
    joinDate: '2023-03-10',
    attendance: 76,
    role: 'Member',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Lisa Wilson',
    email: 'lisa.wilson@email.com',
    phone: '+1 (555) 567-8901',
    joinDate: '2023-04-05',
    attendance: 94,
    role: 'Secretary',
    status: 'Active',
  },
];

const attendanceHistory = [
  { date: '2024-01-24', present: 22, total: 24, percentage: 92 },
  { date: '2024-01-17', present: 20, total: 24, percentage: 83 },
  { date: '2024-01-10', present: 21, total: 24, percentage: 88 },
  { date: '2024-01-03', present: 19, total: 24, percentage: 79 },
  { date: '2023-12-27', present: 18, total: 24, percentage: 75 },
  { date: '2023-12-20', present: 23, total: 24, percentage: 96 },
];

const activities = [
  {
    id: 1,
    type: 'Meeting',
    title: 'Weekly Bible Study',
    date: '2024-01-24',
    description: 'Study on Romans Chapter 8',
    attendance: 22,
  },
  {
    id: 2,
    type: 'Event',
    title: 'Community Service',
    date: '2024-01-20',
    description: 'Food bank volunteering',
    attendance: 18,
  },
  {
    id: 3,
    type: 'Social',
    title: 'Game Night',
    date: '2024-01-15',
    description: 'Fellowship and fun activities',
    attendance: 20,
  },
];

export default function GroupDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // 👈 unwrap the promise
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [isGroupGoalDialogOpen, setIsGroupGoalDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GroupGoal | null>(null);

  const PAGE_LIMIT = 10;

  const filteredMembers = groupMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log({ id });

  const {
    data: groupGoals,
    isLoading: isLoadingGroupGoals,
    isError: isErrorGroupGoals,
    error: errorGroupGoals,
  } = useFetchGroupGoals({
    groupId: id,
    page: 1,
    limit: PAGE_LIMIT,
  });

  // Delete goal mutation
  const {
    mutateAsync: deleteGoalMutation,
    isPending: isPendingDeleteGoal,
    isError: isErrorDeleteGoal,
    error: errorDeleteGoal,
  } = useDeleteGroupGoal();

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoalMutation({
      groupId: id,
      goalId,
    });
    setSelectedGoal(null);
  };
  const openGoalDeleteDialog = (goal: GroupGoal) => {
    setSelectedGoal(goal);
  };

  // Function to open goal dialog in add mode
  const handleAddGroupGoal = () => {
    setSelectedGoal(null);
    setDialogMode('add');
    setIsGroupGoalDialogOpen(true);
  };
  // Function to open goal dialog in edit mode
  const handleEditGroupGoal = (goal: GroupGoal) => {
    setSelectedGoal(goal);
    setDialogMode('edit');
    setIsGroupGoalDialogOpen(true);
  };
  // Function to close goal dialog and reset state
  const handleCloseGroupGoalDialog = () => {
    setIsGroupGoalDialogOpen(false);
    setSelectedGoal(null);
    setDialogMode('add');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/church/groups">
            <Button size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {groupDetails.name}
            </h1>
            <p className="text-muted-foreground">{groupDetails.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Group Details</DialogTitle>
                <DialogDescription>Update group information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="name">
                    Name
                  </Label>
                  <Input
                    className="col-span-3"
                    defaultValue={groupDetails.name}
                    id="name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="capacity">
                    Capacity
                  </Label>
                  <Input
                    className="col-span-3"
                    defaultValue={groupDetails.maxCapacity}
                    id="capacity"
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    className="col-span-3"
                    defaultValue={groupDetails.description}
                    id="description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a member to this group
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="member-name">
                    Name
                  </Label>
                  <Input className="col-span-3" id="member-name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="member-email">
                    Email
                  </Label>
                  <Input
                    className="col-span-3"
                    id="member-email"
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="member-phone">
                    Phone
                  </Label>
                  <Input className="col-span-3" id="member-phone" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right" htmlFor="member-role">
                    Role
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="assistant">
                        Assistant Leader
                      </SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{groupDetails.members}</div>
            <div className="flex items-center space-x-2 text-muted-foreground text-xs">
              <span>of {groupDetails.maxCapacity} capacity</span>
            </div>
            <Progress
              className="mt-2 h-2"
              value={(groupDetails.members / groupDetails.maxCapacity) * 100}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Avg Attendance
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {groupDetails.averageAttendance}%
            </div>
            <p className="text-muted-foreground text-xs">Last 6 meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Meeting Schedule
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-lg">{groupDetails.meetingDay}</div>
            <p className="text-muted-foreground text-xs">
              {groupDetails.meetingTime}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Group Age</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">2</div>
            <p className="text-muted-foreground text-xs">Years active</p>
          </CardContent>
        </Card>
      </div>
      {/* Group Information */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="mr-4 font-medium text-sm">Category</Label>
                <Badge variant="outline">{groupDetails.category}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="mr-4 font-medium text-sm">Status</Label>
                <Badge
                  variant={
                    groupDetails.status === 'Active' ? 'default' : 'secondary'
                  }
                >
                  {groupDetails.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-sm">Meeting Location</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{groupDetails.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="mr-4 font-medium text-sm">Start Date</Label>
                <span className="text-sm">
                  {new Date(groupDetails.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-sm">Group Goals</Label>
              <ul className="space-y-1">
                {groupDetails.goals.map((goal, index) => (
                  <li
                    className="flex items-center space-x-2 text-sm"
                    key={index}
                  >
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Group Leader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={groupDetails.leader.avatar || '/placeholder.svg'}
                />
                <AvatarFallback>
                  {groupDetails.leader.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{groupDetails.leader.name}</h3>
                <p className="text-muted-foreground text-sm">Group Leader</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{groupDetails.leader.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{groupDetails.leader.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Leading since{' '}
                  {new Date(groupDetails.leader.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Detailed Tabs */}
      <Tabs className="space-y-4" defaultValue="members">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-4" value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>
                    Manage group membership and roles
                  </CardDescription>
                </div>
                <div className="relative">
                  <Input
                    className="w-64"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search members..."
                    value={searchTerm}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={'/placeholder.svg?height=32&width=32'}
                            />
                            <AvatarFallback>
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-muted-foreground text-sm">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === 'Member' ? 'outline' : 'default'
                          }
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {member.attendance}%
                          </span>
                          <Progress
                            className="h-2 w-16"
                            value={member.attendance}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === 'Active' ? 'default' : 'secondary'
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
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
        <TabsContent className="space-y-4" value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Track meeting attendance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((record, index) => (
                    <TableRow key={record.date}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.present}
                      </TableCell>
                      <TableCell>{record.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {record.percentage}%
                          </span>
                          <Progress
                            className="h-2 w-16"
                            value={record.percentage}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {index > 0 && (
                          <div className="flex items-center">
                            <TrendingUp
                              className={`h-4 w-4 ${
                                record.percentage >
                                attendanceHistory[index - 1].percentage
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="space-y-4" value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Group meetings, events, and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    className="flex items-start space-x-4 rounded-lg border p-4"
                    key={activity.id}
                  >
                    <div className="flex-shrink-0">
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {activity.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-muted-foreground text-xs">
                        <span>
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                        <span>{activity.attendance} attendees</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="space-y-6" value="goals">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">Group Goals</h3>
              <p className="text-muted-foreground text-sm">
                Track progress on group objectives
              </p>
            </div>
            <Dialog
              onOpenChange={(open) => {
                if (open) setIsGroupGoalDialogOpen(open);
                else handleCloseGroupGoalDialog();
              }}
              open={isGroupGoalDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={handleAddGroupGoal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {dialogMode === 'edit'
                      ? 'Edit Group Goal'
                      : 'Add Group Goal'}
                  </DialogTitle>
                  <DialogDescription>
                    {dialogMode === 'edit'
                      ? 'Update group goal of this group'
                      : 'Add group goal to this group'}
                  </DialogDescription>
                </DialogHeader>
                <AddGroupGoalForm
                  goal={selectedGoal ?? undefined}
                  groupId={id}
                  mode={dialogMode}
                  onCloseDialog={handleCloseGroupGoalDialog}
                />
              </DialogContent>
            </Dialog>
          </div>
          {isErrorGroupGoals && <RenderApiError error={errorGroupGoals} />}
          {isErrorDeleteGoal && <RenderApiError error={errorDeleteGoal} />}
          {isLoadingGroupGoals ? (
            <SpinnerLoader description="Loading group goals..." />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Success Criteria</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupGoals?.data?.goals.map((goal) => (
                      <TableRow key={goal?._id}>
                        <TableCell className="font-medium">
                          {new Date(goal?.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {capitalizeFirstLetter(goal?.title)}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {capitalizeFirstLetter(goal?.description)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {capitalizeFirstLetter(goal?.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(goal?.targetDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {capitalizeFirstLetter(goal?.category)}
                        </TableCell>
                        <TableCell>{`${capitalizeFirstLetter(goal?.assignee?.firstName ?? '')} ${capitalizeFirstLetter(goal?.assignee?.lastName ?? '')}`}</TableCell>
                        <TableCell>
                          {capitalizeFirstLetter(
                            goal?.success ?? 'Not Provided'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleEditGroupGoal(goal)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => openGoalDeleteDialog(goal)}
                              size="sm"
                              variant="destructive"
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
          )}
          {groupGoals?.data?.goals.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">
                No goals found
              </h3>
              <p className="text-gray-500">
                Try adding a new goal or adjusting your search/filter criteria.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* Delete Goal Dialog */}
      <DeleteGoalDialog
        goalId={selectedGoal?._id}
        isDeleting={isPendingDeleteGoal}
        onDelete={handleDeleteGoal}
        onOpenChange={(open) => {
          if (!open) setSelectedGoal(null);
        }}
        open={!!selectedGoal}
      />
    </div>
  );
}
