'use client';

import type React from 'react';

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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Gift,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function MemberDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock member data - in real app, fetch based on params.id
  const member = {
    id: params.id,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    birthDate: 'June 15, 1985',
    joinDate: 'March 10, 2020',
    membershipStatus: 'Active',
    membershipType: 'Full Member',
    maritalStatus: 'Married',
    occupation: 'Teacher',
    emergencyContact: 'John Johnson - +1 (555) 987-6543',
    ministries: ["Children's Ministry", 'Worship Team'],
    skills: ['Music', 'Teaching', 'Administration'],
    notes: "Very active in children's ministry. Has leadership potential.",
    baptized: true,
    confirmed: true,
    smallGroup: 'Young Adults Group',
    servingAreas: ['Sunday School', 'Choir'],
    totalGiving: 3250,
    averageAttendance: 85,
    volunteerHours: 120,
  };

  const attendanceData = [
    { month: 'Jan', attendance: 4, services: 4 },
    { month: 'Feb', attendance: 3, services: 4 },
    { month: 'Mar', attendance: 4, services: 5 },
    { month: 'Apr', attendance: 4, services: 4 },
    { month: 'May', attendance: 3, services: 4 },
    { month: 'Jun', attendance: 4, services: 4 },
  ];

  const givingData = [
    { month: 'Jan', amount: 500 },
    { month: 'Feb', amount: 450 },
    { month: 'Mar', amount: 600 },
    { month: 'Apr', amount: 500 },
    { month: 'May', amount: 550 },
    { month: 'Jun', amount: 650 },
  ];

  const involvementData = [
    { name: 'Worship', hours: 40, color: '#8884d8' },
    { name: "Children's Ministry", hours: 60, color: '#82ca9d' },
    { name: 'Administration', hours: 20, color: '#ffc658' },
  ];

  const recentActivities = [
    {
      date: '2024-12-20',
      activity: 'Attended Sunday Service',
      type: 'Attendance',
    },
    {
      date: '2024-12-18',
      activity: 'Volunteered at Food Drive',
      type: 'Service',
    },
    { date: '2024-12-15', activity: 'Donated $250 (Tithe)', type: 'Giving' },
    {
      date: '2024-12-12',
      activity: "Led Children's Bible Study",
      type: 'Ministry',
    },
    {
      date: '2024-12-10',
      activity: 'Attended Prayer Meeting',
      type: 'Attendance',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Attendance':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'Service':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'Giving':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'Ministry':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button size="sm" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">{member.name}</h1>
            <p className="text-muted-foreground">User profile and analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact
          </Button>
          <Link href={`/dashboard/users/edit/${member.id}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Member Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                alt={member.name}
                src="/placeholder.svg?height=96&width=96"
              />
              <AvatarFallback className="text-lg">SJ</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-muted-foreground text-sm">
                {member.membershipType}
              </p>
              <Badge className="mt-2" variant="default">
                {member.membershipStatus}
              </Badge>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">{member.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {member.joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:col-span-3 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total Giving
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                ${member.totalGiving.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">This year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Attendance Rate
              </CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {member.averageAttendance}%
              </div>
              <p className="text-muted-foreground text-xs">Last 6 months</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Volunteer Hours
              </CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{member.volunteerHours}</div>
              <p className="text-muted-foreground text-xs">This year</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
          <TabsTrigger value="involvement">Involvement</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic member details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="font-medium text-sm">Birth Date</Label>
                    <p className="text-muted-foreground text-sm">
                      {member.birthDate}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium text-sm">
                      Marital Status
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {member.maritalStatus}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium text-sm">Occupation</Label>
                    <p className="text-muted-foreground text-sm">
                      {member.occupation}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium text-sm">Small Group</Label>
                    <p className="text-muted-foreground text-sm">
                      {member.smallGroup}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-sm">
                    Emergency Contact
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    {member.emergencyContact}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Spiritual Status */}
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Status</CardTitle>
                <CardDescription>
                  Baptism and confirmation status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Baptized</span>
                  <Badge variant={member.baptized ? 'default' : 'secondary'}>
                    {member.baptized ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Confirmed</span>
                  <Badge variant={member.confirmed ? 'default' : 'secondary'}>
                    {member.confirmed ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium text-sm">Member Since</Label>
                  <p className="text-muted-foreground text-sm">
                    {member.joinDate}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Membership Type</Label>
                  <p className="text-muted-foreground text-sm">
                    {member.membershipType}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Ministry Involvement */}
            <Card>
              <CardHeader>
                <CardTitle>Ministry Involvement</CardTitle>
                <CardDescription>
                  Current ministry participation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium text-sm">
                    Active Ministries
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.ministries.map((ministry, index) => (
                      <Badge key={index} variant="default">
                        {ministry}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-sm">Serving Areas</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.servingAreas.map((area, index) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Notes</CardTitle>
                <CardDescription>
                  Member skills and additional information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium text-sm">Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-sm">Notes</Label>
                  <p className="text-muted-foreground text-sm">
                    {member.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>
                Monthly attendance patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#8884d8" name="Attended" />
                  <Bar
                    dataKey="services"
                    fill="#82ca9d"
                    name="Total Services"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>Overall attendance statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Average Attendance
                  </span>
                  <span className="font-bold text-2xl">
                    {member.averageAttendance}%
                  </span>
                </div>
                <Progress className="w-full" value={member.averageAttendance} />
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Services Attended</span>
                    <span>22/26</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consecutive Weeks</span>
                    <span>4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Month</span>
                    <span>March (100%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Preferences</CardTitle>
                <CardDescription>Most attended service types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sunday Morning Service</span>
                    <div className="flex items-center space-x-2">
                      <Progress className="w-20" value={95} />
                      <span className="font-medium text-sm">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bible Study</span>
                    <div className="flex items-center space-x-2">
                      <Progress className="w-20" value={80} />
                      <span className="font-medium text-sm">80%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prayer Meeting</span>
                    <div className="flex items-center space-x-2">
                      <Progress className="w-20" value={60} />
                      <span className="font-medium text-sm">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Youth Service</span>
                    <div className="flex items-center space-x-2">
                      <Progress className="w-20" value={40} />
                      <span className="font-medium text-sm">40%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="giving">
          <Card>
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
              <CardDescription>
                Monthly giving patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer height={300} width="100%">
                <LineChart data={givingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey="amount"
                    stroke="#8884d8"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Giving</CardTitle>
                <CardDescription>Year to date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">
                  ${member.totalGiving.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-sm">
                  +15% from last year
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Monthly</CardTitle>
                <CardDescription>Regular giving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">
                  ${Math.round(member.totalGiving / 6).toLocaleString()}
                </div>
                <p className="text-muted-foreground text-sm">Last 6 months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Giving Consistency</CardTitle>
                <CardDescription>Regular contributor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">100%</div>
                <p className="text-muted-foreground text-sm">6/6 months</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="involvement">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ministry Hours Distribution</CardTitle>
                <CardDescription>
                  Time spent in different ministries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={involvementData}
                      dataKey="hours"
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      outerRadius={80}
                    >
                      {involvementData.map((entry, index) => (
                        <Cell fill={entry.color} key={`cell-${index}`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leadership & Recognition</CardTitle>
                <CardDescription>
                  Achievements and leadership roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Volunteer of the Month</h4>
                    <p className="text-muted-foreground text-sm">March 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Children's Ministry Leader</h4>
                    <p className="text-muted-foreground text-sm">
                      Since January 2023
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Faithful Giver</h4>
                    <p className="text-muted-foreground text-sm">
                      12 consecutive months
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Small Group Coordinator</h4>
                    <p className="text-muted-foreground text-sm">
                      Young Adults Group
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest member activities and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    className="flex items-center space-x-4 rounded-lg border p-4"
                    key={index}
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.activity}</h4>
                      <p className="text-muted-foreground text-sm">
                        {activity.date}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <label className={`font-medium text-sm ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
