"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  BarChart3,
  BookOpen,
  Heart,
  Baby,
  Gamepad2,
  Coffee,
  Music,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data
const smallGroups = [
  {
    id: 1,
    name: "Young Adults Bible Study",
    leader: "Sarah Johnson",
    coLeader: "Mike Davis",
    category: "Bible Study",
    members: 12,
    capacity: 15,
    meetingDay: "Wednesday",
    meetingTime: "7:00 PM",
    location: "Room 201",
    description: "Deep dive into scripture for young adults",
    status: "Active",
    growth: 20,
    established: "2023",
    icon: BookOpen,
  },
  {
    id: 2,
    name: "Marriage Enrichment",
    leader: "John & Mary Smith",
    coLeader: "David Wilson",
    category: "Marriage",
    members: 8,
    capacity: 10,
    meetingDay: "Friday",
    meetingTime: "7:30 PM",
    location: "Fellowship Hall",
    description: "Strengthening marriages through biblical principles",
    status: "Active",
    growth: 14,
    established: "2022",
    icon: Heart,
  },
  {
    id: 3,
    name: "Men's Fellowship",
    leader: "Robert Taylor",
    coLeader: "James Brown",
    category: "Fellowship",
    members: 15,
    capacity: 20,
    meetingDay: "Saturday",
    meetingTime: "8:00 AM",
    location: "Coffee Shop",
    description: "Men gathering for fellowship and accountability",
    status: "Active",
    growth: 7,
    established: "2021",
    icon: Coffee,
  },
  {
    id: 4,
    name: "Women's Prayer Circle",
    leader: "Lisa Davis",
    coLeader: "Jennifer Lee",
    category: "Prayer",
    members: 18,
    capacity: 25,
    meetingDay: "Tuesday",
    meetingTime: "10:00 AM",
    location: "Prayer Room",
    description: "Women united in prayer and support",
    status: "Active",
    growth: 12,
    established: "2020",
    icon: Heart,
  },
  {
    id: 5,
    name: "Youth Discipleship",
    leader: "Michael Brown",
    coLeader: "Sarah Wilson",
    category: "Youth",
    members: 22,
    capacity: 30,
    meetingDay: "Sunday",
    meetingTime: "6:00 PM",
    location: "Youth Center",
    description: "Discipling teenagers in their faith journey",
    status: "Growing",
    growth: 35,
    established: "2023",
    icon: Gamepad2,
  },
  {
    id: 6,
    name: "Children's Ministry Team",
    leader: "Amanda Johnson",
    coLeader: "Tom Davis",
    category: "Children",
    members: 10,
    capacity: 12,
    meetingDay: "Thursday",
    meetingTime: "6:30 PM",
    location: "Children's Room",
    description: "Planning and coordinating children's activities",
    status: "Active",
    growth: -5,
    established: "2022",
    icon: Baby,
  },
  {
    id: 7,
    name: "Worship Team",
    leader: "Daniel Lee",
    coLeader: "Grace Kim",
    category: "Worship",
    members: 14,
    capacity: 16,
    meetingDay: "Thursday",
    meetingTime: "7:00 PM",
    location: "Sanctuary",
    description: "Musicians and vocalists serving in worship",
    status: "Active",
    growth: 8,
    established: "2021",
    icon: Music,
  },
]

const attendanceData = [
  { month: "Jan", total: 95, active: 88, new: 7 },
  { month: "Feb", total: 102, active: 92, new: 10 },
  { month: "Mar", total: 108, active: 96, new: 12 },
  { month: "Apr", total: 115, active: 99, new: 16 },
]

const categoryDistribution = [
  { name: "Bible Study", value: 12, color: "#3b82f6" },
  { name: "Youth", value: 22, color: "#10b981" },
  { name: "Prayer", value: 18, color: "#f59e0b" },
  { name: "Fellowship", value: 15, color: "#ef4444" },
  { name: "Worship", value: 14, color: "#8b5cf6" },
  { name: "Children", value: 10, color: "#06b6d4" },
  { name: "Marriage", value: 8, color: "#84cc16" },
]

const meetingDays = [
  { day: "Sunday", groups: 1 },
  { day: "Monday", groups: 0 },
  { day: "Tuesday", groups: 1 },
  { day: "Wednesday", groups: 1 },
  { day: "Thursday", groups: 2 },
  { day: "Friday", groups: 1 },
  { day: "Saturday", groups: 1 },
]

export default function SmallGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDay, setSelectedDay] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredGroups = smallGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || group.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesDay = selectedDay === "all" || group.meetingDay.toLowerCase() === selectedDay.toLowerCase()
    return matchesSearch && matchesCategory && matchesDay
  })

  const totalMembers = smallGroups.reduce((sum, group) => sum + group.members, 0)
  const totalCapacity = smallGroups.reduce((sum, group) => sum + group.capacity, 0)
  const averageGrowth = smallGroups.reduce((sum, group) => sum + group.growth, 0) / smallGroups.length
  const activeGroups = smallGroups.filter((group) => group.status === "Active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Small Groups</h1>
          <p className="text-gray-600 mt-1">Manage and monitor small group ministries</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Small Group</DialogTitle>
              <DialogDescription>Create a new small group ministry</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input id="group-name" placeholder="Enter group name" />
              </div>
              <div>
                <Label htmlFor="group-leader">Group Leader</Label>
                <Input id="group-leader" placeholder="Enter leader name" />
              </div>
              <div>
                <Label htmlFor="group-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bible-study">Bible Study</SelectItem>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                    <SelectItem value="prayer">Prayer</SelectItem>
                    <SelectItem value="youth">Youth</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="marriage">Marriage</SelectItem>
                    <SelectItem value="worship">Worship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group-day">Meeting Day</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div>
                  <Label htmlFor="group-time">Meeting Time</Label>
                  <Input id="group-time" placeholder="7:00 PM" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group-location">Location</Label>
                  <Input id="group-location" placeholder="Room 101" />
                </div>
                <div>
                  <Label htmlFor="group-capacity">Capacity</Label>
                  <Input id="group-capacity" type="number" placeholder="15" />
                </div>
              </div>
              <div>
                <Label htmlFor="group-description">Description</Label>
                <Textarea id="group-description" placeholder="Describe the group's purpose" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Add Group</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smallGroups.length}</div>
            <p className="text-xs text-muted-foreground">{activeGroups} active groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalMembers / totalCapacity) * 100)}%</div>
            <p className="text-xs text-muted-foreground">{totalCapacity - totalMembers} spots available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            {averageGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {averageGrowth > 0 ? "+" : ""}
              {averageGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Attendance Trends</CardTitle>
                <CardDescription>Monthly attendance across all groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    total: { label: "Total", color: "#3b82f6" },
                    active: { label: "Active Members", color: "#10b981" },
                    new: { label: "New Members", color: "#f59e0b" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                      <Line type="monotone" dataKey="active" stroke="var(--color-active)" strokeWidth={2} />
                      <Line type="monotone" dataKey="new" stroke="var(--color-new)" strokeWidth={2} />
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
                  config={{
                    value: { label: "Members" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Schedule</CardTitle>
                <CardDescription>Groups by meeting day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    groups: { label: "Groups", color: "#3b82f6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
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
                    <div key={group.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <group.icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-sm">{group.name}</span>
                      </div>
                      <div className={`flex items-center ${group.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {group.growth >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">
                          {group.growth > 0 ? "+" : ""}
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

        <TabsContent value="management" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <Select value={selectedDay} onValueChange={setSelectedDay}>
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
              <CardDescription>Manage all small group ministries</CardDescription>
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
                          <div className="bg-blue-100 p-1.5 rounded-lg">
                            <group.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-gray-500">{group.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.leader}</div>
                          {group.coLeader && <div className="text-sm text-gray-500">Co-leader: {group.coLeader}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{group.meetingDay}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{group.meetingTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{group.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{group.members}</span>
                          <span className="text-gray-500">/{group.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(group.members / group.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center ${group.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {group.growth >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {group.growth > 0 ? "+" : ""}
                          {group.growth}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={group.status === "Active" ? "default" : "secondary"}>{group.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
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
  )
}
