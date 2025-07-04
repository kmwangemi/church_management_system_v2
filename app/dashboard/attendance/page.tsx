"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
} from "lucide-react"
import { AttendanceCheckInForm } from "@/components/forms/attendance-check-in-form"

// Mock data
const attendanceRecords = [
  {
    id: 1,
    date: "2024-01-07",
    service: "Sunday Morning Service",
    totalAttendance: 456,
    expectedAttendance: 520,
    attendanceRate: 87.7,
    checkInTime: "09:00 AM",
    checkOutTime: "11:30 AM",
  },
  {
    id: 2,
    date: "2024-01-03",
    service: "Wednesday Bible Study",
    totalAttendance: 89,
    expectedAttendance: 120,
    attendanceRate: 74.2,
    checkInTime: "07:00 PM",
    checkOutTime: "08:30 PM",
  },
  {
    id: 3,
    date: "2023-12-31",
    service: "New Year's Eve Service",
    totalAttendance: 678,
    expectedAttendance: 600,
    attendanceRate: 113.0,
    checkInTime: "10:00 PM",
    checkOutTime: "12:30 AM",
  },
]

const memberAttendance = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Present",
    checkInTime: "09:15 AM",
    department: "Choir",
    attendanceRate: 95,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Present",
    checkInTime: "09:05 AM",
    department: "Ushering",
    attendanceRate: 88,
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Absent",
    checkInTime: "-",
    department: "Youth",
    attendanceRate: 72,
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.w@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Late",
    checkInTime: "09:45 AM",
    department: "Administration",
    attendanceRate: 91,
  },
]

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState("all")
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)

  const filteredMembers = memberAttendance.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalPresent: memberAttendance.filter((m) => m.status === "Present").length,
    totalAbsent: memberAttendance.filter((m) => m.status === "Absent").length,
    totalLate: memberAttendance.filter((m) => m.status === "Late").length,
    attendanceRate: Math.round(
      (memberAttendance.filter((m) => m.status === "Present").length / memberAttendance.length) * 100,
    ),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track member attendance and service participation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <QrCode className="mr-2 h-4 w-4" />
            QR Check-in
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="mr-2 h-4 w-4" />
                Manual Check-in
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manual Check-in</DialogTitle>
                <DialogDescription>Check in members manually for today's service</DialogDescription>
              </DialogHeader>
              <AttendanceCheckInForm onSuccess={() => setIsCheckInOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPresent}</div>
            <p className="text-xs text-gray-500 mt-1">Members checked in</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Absent Today</CardTitle>
            <div className="bg-red-100 p-2 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalAbsent}</div>
            <p className="text-xs text-gray-500 mt-1">Members absent</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Late Arrivals</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalLate}</div>
            <p className="text-xs text-gray-500 mt-1">Arrived after start</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedService} onValueChange={setSelectedService}>
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
                      <TableRow key={member.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.department}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.status === "Present" && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Present
                            </Badge>
                          )}
                          {member.status === "Absent" && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                          {member.status === "Late" && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Late
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{member.checkInTime}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${member.attendanceRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{member.attendanceRate}%</span>
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

        <TabsContent value="history" className="space-y-6">
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
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{record.service}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {record.totalAttendance} / {record.expectedAttendance}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.attendanceRate >= 80 ? "default" : "secondary"}
                            className={
                              record.attendanceRate >= 80
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {record.attendanceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sunday Service</span>
                    <span className="text-sm text-gray-600">456 avg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wednesday Study</span>
                    <span className="text-sm text-gray-600">89 avg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "74%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Friday Youth</span>
                    <span className="text-sm text-gray-600">67 avg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "82%" }}></div>
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
                    <span className="text-sm font-medium">Choir</span>
                    <span className="text-sm text-gray-600">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ushering</span>
                    <span className="text-sm text-gray-600">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Youth</span>
                    <span className="text-sm text-gray-600">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
