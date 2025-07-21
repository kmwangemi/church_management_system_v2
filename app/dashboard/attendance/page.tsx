'use client';

import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  QrCode,
  Search,
  TrendingUp,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { AttendanceCheckInForm } from '@/components/forms/attendance-check-in-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Mock data
const attendanceRecords = [
  {
    id: 1,
    date: '2024-01-07',
    service: 'Sunday Morning Service',
    totalAttendance: 456,
    expectedAttendance: 520,
    attendanceRate: 87.7,
    checkInTime: '09:00 AM',
    checkOutTime: '11:30 AM',
  },
  {
    id: 2,
    date: '2024-01-03',
    service: 'Wednesday Bible Study',
    totalAttendance: 89,
    expectedAttendance: 120,
    attendanceRate: 74.2,
    checkInTime: '07:00 PM',
    checkOutTime: '08:30 PM',
  },
  {
    id: 3,
    date: '2023-12-31',
    service: "New Year's Eve Service",
    totalAttendance: 678,
    expectedAttendance: 600,
    attendanceRate: 113.0,
    checkInTime: '10:00 PM',
    checkOutTime: '12:30 AM',
  },
];

const memberAttendance = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'Present',
    checkInTime: '09:15 AM',
    department: 'Choir',
    attendanceRate: 95,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'Present',
    checkInTime: '09:05 AM',
    department: 'Ushering',
    attendanceRate: 88,
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'Absent',
    checkInTime: '-',
    department: 'Youth',
    attendanceRate: 72,
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.w@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    status: 'Late',
    checkInTime: '09:45 AM',
    department: 'Administration',
    attendanceRate: 91,
  },
];

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const filteredMembers = memberAttendance.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalPresent: memberAttendance.filter((m) => m.status === 'Present').length,
    totalAbsent: memberAttendance.filter((m) => m.status === 'Absent').length,
    totalLate: memberAttendance.filter((m) => m.status === 'Late').length,
    attendanceRate: Math.round(
      (memberAttendance.filter((m) => m.status === 'Present').length /
        memberAttendance.length) *
        100
    ),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Attendance Management
          </h1>
          <p className="mt-1 text-gray-600">
            Track member attendance and service participation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            QR Check-in
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog onOpenChange={setIsCheckInOpen} open={isCheckInOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="mr-2 h-4 w-4" />
                Manual Check-in
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manual Check-in</DialogTitle>
                <DialogDescription>
                  Check in members manually for today's service
                </DialogDescription>
              </DialogHeader>
              <AttendanceCheckInForm
                onSuccess={() => setIsCheckInOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Present Today
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.totalPresent}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Members checked in</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Absent Today
            </CardTitle>
            <div className="rounded-lg bg-red-100 p-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {stats.totalAbsent}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Members absent</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Late Arrivals
            </CardTitle>
            <div className="rounded-lg bg-orange-100 p-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">
              {stats.totalLate}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Arrived after start</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Attendance Rate
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">
              {stats.attendanceRate}%
            </div>
            <p className="mt-1 text-gray-500 text-xs">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs className="space-y-6" defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="today">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                  <Input
                    className="pl-10"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search members..."
                    value={searchTerm}
                  />
                </div>
                <Select
                  onValueChange={setSelectedService}
                  value={selectedService}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="morning">Morning Service</SelectItem>
                    <SelectItem value="evening">Evening Service</SelectItem>
                    <SelectItem value="bible-study">Bible Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow className="hover:bg-gray-50" key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                alt={member.name}
                                src={member.avatar || '/placeholder.svg'}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.department}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.status === 'Present' && (
                            <Badge className="border-green-200 bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Present
                            </Badge>
                          )}
                          {member.status === 'Absent' && (
                            <Badge className="border-red-200 bg-red-100 text-red-800">
                              <XCircle className="mr-1 h-3 w-3" />
                              Absent
                            </Badge>
                          )}
                          {member.status === 'Late' && (
                            <Badge className="border-orange-200 bg-orange-100 text-orange-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Late
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900 text-sm">
                            {member.checkInTime}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-16 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${member.attendanceRate}%` }}
                              />
                            </div>
                            <span className="font-medium text-sm">
                              {member.attendanceRate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="history">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{record.service}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {record.totalAttendance} /{' '}
                            {record.expectedAttendance}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.attendanceRate >= 80
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                            variant={
                              record.attendanceRate >= 80
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {record.attendanceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 text-sm">
                            {record.checkInTime} - {record.checkOutTime}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="analytics">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Sunday Service</span>
                    <span className="text-gray-600 text-sm">456 avg</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: '87%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Wednesday Study</span>
                    <span className="text-gray-600 text-sm">89 avg</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: '74%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Friday Youth</span>
                    <span className="text-gray-600 text-sm">67 avg</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-purple-600"
                      style={{ width: '82%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Choir</span>
                    <span className="text-gray-600 text-sm">95%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: '95%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Ushering</span>
                    <span className="text-gray-600 text-sm">88%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: '88%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Youth</span>
                    <span className="text-gray-600 text-sm">72%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-orange-600"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
