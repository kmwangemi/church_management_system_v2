'use client';

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
import React, { useState } from 'react';

export default function DepartmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // 👈 unwrap the promise
  const [isEditing, setIsEditing] = useState(false);

  // Mock department data - in real app, fetch based on params.id
  const department = {
    id,
    name: 'Worship Ministry',
    head: {
      name: 'Sarah Wilson',
      id: 'staff-001',
      phone: '+1 (555) 123-4567',
      email: 'sarah.wilson@church.com',
      avatar: '/placeholder.svg?height=64&width=64',
      position: 'Worship Pastor',
      joinDate: '2020-01-15',
    },
    branch: 'Main Campus',
    branchId: 1,
    members: 15,
    budget: 25_000,
    budgetUsed: 18_500,
    status: 'Active',
    category: 'Ministry',
    description:
      'Leads worship services and music ministry across all services, coordinating with musicians, vocalists, and technical teams to create meaningful worship experiences.',
    established: '2020-01-15',
    meetingDay: 'Thursday',
    meetingTime: '7:00 PM',
    location: 'Music Room',
    goals: [
      'Expand worship team to 20 members',
      'Implement new sound system',
      'Launch contemporary service',
      'Train 5 new worship leaders',
    ],
  };

  const departmentMembers = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Lead Guitarist',
      email: 'john.smith@email.com',
      phone: '+1 (555) 234-5678',
      joinDate: '2021-03-15',
      status: 'Active',
      skills: ['Guitar', 'Vocals', 'Music Theory'],
      avatar: '/placeholder.svg?height=32&width=32',
    },
    {
      id: 2,
      name: 'Emily Davis',
      role: 'Vocalist',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 345-6789',
      joinDate: '2021-06-20',
      status: 'Active',
      skills: ['Vocals', 'Piano', 'Songwriting'],
      avatar: '/placeholder.svg?height=32&width=32',
    },
    {
      id: 3,
      name: 'Michael Brown',
      role: 'Drummer',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 456-7890',
      joinDate: '2020-11-10',
      status: 'Active',
      skills: ['Drums', 'Percussion', 'Audio Engineering'],
      avatar: '/placeholder.svg?height=32&width=32',
    },
    {
      id: 4,
      name: 'Lisa Wilson',
      role: 'Keyboardist',
      email: 'lisa.wilson@email.com',
      phone: '+1 (555) 567-8901',
      joinDate: '2022-01-05',
      status: 'Active',
      skills: ['Piano', 'Keyboard', 'Music Arrangement'],
      avatar: '/placeholder.svg?height=32&width=32',
    },
  ];

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
          <Link href="/dashboard/departments">
            <Button size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {department.name}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{department.members}</div>
            <p className="text-muted-foreground text-xs">Active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Budget Usage</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {Math.round((department.budgetUsed / department.budget) * 100)}%
            </div>
            <p className="text-muted-foreground text-xs">
              KES {department.budgetUsed.toLocaleString()} used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Years Active</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">4</div>
            <p className="text-muted-foreground text-xs">
              Since {new Date(department.established).getFullYear()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Activities</CardTitle>
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
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="deptName">Department Name</Label>
                      <Input defaultValue={department.name} id="deptName" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue={department.category.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ministry">Ministry</SelectItem>
                          <SelectItem value="administrative">
                            Administrative
                          </SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingLocation">Meeting Location</Label>
                      <Input
                        defaultValue={department.location}
                        id="meetingLocation"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meetingDay">Meeting Day</Label>
                        <Select
                          defaultValue={department.meetingDay.toLowerCase()}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meetingTime">Meeting Time</Label>
                        <Input
                          defaultValue={department.meetingTime}
                          id="meetingTime"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Category: {department.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{department.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {department.meetingDay}s at {department.meetingTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Established:{' '}
                        {new Date(department.established).toLocaleDateString()}
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
                      src={department.head.avatar || '/placeholder.svg'}
                    />
                    <AvatarFallback>
                      {department.head.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{department.head.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {department.head.position}
                    </p>
                    <Badge variant="outline">{department.status}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{department.head.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{department.head.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Leading since{' '}
                      {new Date(department.head.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="flex-1 bg-transparent"
                    size="sm"
                    variant="outline"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button
                    className="flex-1 bg-transparent"
                    size="sm"
                    variant="outline"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>Department mission and overview</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea defaultValue={department.description} rows={4} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {department.description}
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department Member</DialogTitle>
                  <DialogDescription>
                    Add a member to this department
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberSelect">Select Member</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a church member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member-1">Jane Doe</SelectItem>
                        <SelectItem value="member-2">Bob Smith</SelectItem>
                        <SelectItem value="member-3">Alice Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberRole">Role in Department</Label>
                    <Input
                      id="memberRole"
                      placeholder="e.g., Vocalist, Guitarist"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., Guitar, Vocals, Piano"
                    />
                  </div>
                  <Button className="w-full">Add Member</Button>
                </div>
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
                  {departmentMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.avatar || '/placeholder.svg'}
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
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map((skill, index) => (
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
                        {new Date(member.joinDate).toLocaleDateString()}
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
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
                    <span className="font-medium text-sm">Total Allocated</span>
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
                <CardDescription>Breakdown by expense category</CardDescription>
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
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
                          <div className="font-medium">{activity.title}</div>
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
          <div className="grid gap-4">
            {department.goals.map((goal, index) => (
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
    </div>
  );
}
