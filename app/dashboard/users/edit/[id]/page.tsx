'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  DollarSign,
  Heart,
  Save,
  Upload,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const [birthDate, setBirthDate] = useState<Date>();
  const [joinDate, setJoinDate] = useState<Date>();

  // Mock member data - in real app, fetch based on params.id
  const member = {
    id: params.id,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, ST 12345',
    birthDate: '1985-06-15',
    joinDate: '2020-03-10',
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
  };

  const attendanceHistory = [
    { date: '2024-12-15', service: 'Sunday Service', status: 'Present' },
    { date: '2024-12-12', service: 'Bible Study', status: 'Present' },
    { date: '2024-12-08', service: 'Sunday Service', status: 'Present' },
    { date: '2024-12-05', service: 'Prayer Meeting', status: 'Absent' },
    { date: '2024-12-01', service: 'Sunday Service', status: 'Present' },
  ];

  const givingHistory = [
    { date: '2024-12-15', type: 'Tithe', amount: 250, method: 'Online' },
    { date: '2024-12-08', type: 'Offering', amount: 50, method: 'Cash' },
    { date: '2024-12-01', type: 'Tithe', amount: 250, method: 'Online' },
    {
      date: '2024-11-24',
      type: 'Special Offering',
      amount: 100,
      method: 'Check',
    },
  ];

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
            <h1 className="font-bold text-3xl tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">
              Update user information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs className="space-y-4" defaultValue="personal">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="church">Church Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>
                  Update member's profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    alt={member.name}
                    src="/placeholder.svg?height=96&width=96"
                  />
                  <AvatarFallback className="text-lg">SJ</AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input defaultValue="Sarah" id="firstName" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input defaultValue="Johnson" id="lastName" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input defaultValue={member.email} id="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input defaultValue={member.phone} id="phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea defaultValue={member.address} id="address" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>
                  Additional personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Birth Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={setBirthDate}
                        selected={birthDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select defaultValue={member.maritalStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input defaultValue={member.occupation} id="occupation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    defaultValue={member.emergencyContact}
                    id="emergencyContact"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
                <CardDescription>
                  Member's skills and areas of interest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newSkill">Add New Skill</Label>
                  <div className="flex space-x-2">
                    <Input id="newSkill" placeholder="Enter skill" />
                    <Button variant="outline">Add</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea defaultValue={member.notes} id="notes" rows={4} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="church">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Membership Information */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Information</CardTitle>
                <CardDescription>
                  Church membership details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {joinDate ? format(joinDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={setJoinDate}
                        selected={joinDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipStatus">Membership Status</Label>
                  <Select defaultValue={member.membershipStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Visitor">Visitor</SelectItem>
                      <SelectItem value="New Member">New Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select defaultValue={member.membershipType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Member">Full Member</SelectItem>
                      <SelectItem value="Associate Member">
                        Associate Member
                      </SelectItem>
                      <SelectItem value="Youth Member">Youth Member</SelectItem>
                      <SelectItem value="Child Member">Child Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smallGroup">Small Group</Label>
                  <Select defaultValue={member.smallGroup}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Young Adults Group">
                        Young Adults Group
                      </SelectItem>
                      <SelectItem value="Couples Group">
                        Couples Group
                      </SelectItem>
                      <SelectItem value="Seniors Group">
                        Seniors Group
                      </SelectItem>
                      <SelectItem value="Bible Study Group">
                        Bible Study Group
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Spiritual Status */}
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Status</CardTitle>
                <CardDescription>
                  Baptism, confirmation, and spiritual milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="baptized">Baptized</Label>
                  <Switch defaultChecked={member.baptized} id="baptized" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="confirmed">Confirmed</Label>
                  <Switch defaultChecked={member.confirmed} id="confirmed" />
                </div>
                <div className="space-y-2">
                  <Label>Baptism Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Select date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar initialFocus mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Confirmation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="w-full justify-start text-left font-normal"
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Select date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar initialFocus mode="single" />
                    </PopoverContent>
                  </Popover>
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
                  Current and past ministry participation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Ministries</Label>
                  <div className="flex flex-wrap gap-2">
                    {member.ministries.map((ministry, index) => (
                      <Badge key={index} variant="default">
                        {ministry}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newMinistry">Add Ministry</Label>
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ministry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worship">Worship Team</SelectItem>
                        <SelectItem value="children">
                          Children's Ministry
                        </SelectItem>
                        <SelectItem value="youth">Youth Ministry</SelectItem>
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="prayer">Prayer Ministry</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Serving Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Serving Areas</CardTitle>
                <CardDescription>
                  Areas where member serves regularly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Serving Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {member.servingAreas.map((area, index) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newServingArea">Add Serving Area</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="newServingArea"
                      placeholder="Enter serving area"
                    />
                    <Button variant="outline">Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="history">
          <Card>
            <CardHeader>
              <CardTitle>Member History</CardTitle>
              <CardDescription>
                Timeline of important events and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Joined Church</h4>
                    <p className="text-muted-foreground text-sm">
                      Became a full member
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    March 10, 2020
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-shrink-0">
                    <Heart className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Joined Children's Ministry</h4>
                    <p className="text-muted-foreground text-sm">
                      Started serving in children's ministry
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    June 15, 2020
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Started Regular Giving</h4>
                    <p className="text-muted-foreground text-sm">
                      Began monthly tithe contributions
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    August 1, 2020
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent attendance records and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceHistory.map((record, index) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-4"
                    key={index}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{record.service}</h4>
                        <p className="text-muted-foreground text-sm">
                          {record.date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        record.status === 'Present' ? 'default' : 'secondary'
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="giving">
          <Card>
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
              <CardDescription>
                Contribution records and giving patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {givingHistory.map((record, index) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-4"
                    key={index}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{record.type}</h4>
                        <p className="text-muted-foreground text-sm">
                          {record.date} • {record.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${record.amount}</div>
                    </div>
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
