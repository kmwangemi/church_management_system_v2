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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  BarChart3,
  Music,
  Heart,
  BookOpen,
  Baby,
  Gamepad2,
  Headphones,
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
const departments = [
  {
    id: 1,
    name: "Worship & Music",
    head: "Sarah Johnson",
    members: 25,
    budget: 15000,
    activities: 12,
    established: "2020",
    status: "Active",
    growth: 15,
    icon: Music,
    description: "Leading worship services and music ministry",
  },
  {
    id: 2,
    name: "Children's Ministry",
    head: "Michael Brown",
    members: 18,
    budget: 8000,
    activities: 8,
    established: "2018",
    status: "Active",
    growth: 22,
    icon: Baby,
    description: "Nurturing children's spiritual growth",
  },
  {
    id: 3,
    name: "Youth Ministry",
    head: "Lisa Davis",
    members: 15,
    budget: 12000,
    activities: 15,
    established: "2019",
    status: "Active",
    growth: 8,
    icon: Gamepad2,
    description: "Engaging teenagers in faith and community",
  },
  {
    id: 4,
    name: "Outreach & Missions",
    head: "David Wilson",
    members: 22,
    budget: 20000,
    activities: 6,
    established: "2017",
    status: "Active",
    growth: 5,
    icon: Heart,
    description: "Serving the community and global missions",
  },
  {
    id: 5,
    name: "Adult Education",
    head: "Jennifer Lee",
    members: 12,
    budget: 5000,
    activities: 10,
    established: "2021",
    status: "Growing",
    growth: 30,
    icon: BookOpen,
    description: "Bible studies and adult learning programs",
  },
  {
    id: 6,
    name: "Prayer Ministry",
    head: "Robert Taylor",
    members: 20,
    budget: 3000,
    activities: 4,
    established: "2016",
    status: "Active",
    growth: -2,
    icon: Headphones,
    description: "Coordinating prayer requests and intercession",
  },
]

const departmentBudgets = [
  { name: "Worship", budget: 15000, spent: 12000 },
  { name: "Children", budget: 8000, spent: 6500 },
  { name: "Youth", budget: 12000, spent: 9800 },
  { name: "Outreach", budget: 20000, spent: 18500 },
  { name: "Education", budget: 5000, spent: 3200 },
  { name: "Prayer", budget: 3000, spent: 2100 },
]

const activityData = [
  { month: "Jan", worship: 10, children: 6, youth: 12, outreach: 4, education: 8, prayer: 3 },
  { month: "Feb", worship: 11, children: 7, youth: 13, outreach: 5, education: 9, prayer: 4 },
  { month: "Mar", worship: 12, children: 8, youth: 15, outreach: 6, education: 10, prayer: 4 },
  { month: "Apr", worship: 12, children: 8, youth: 15, outreach: 6, education: 10, prayer: 4 },
]

const memberDistribution = [
  { name: "Worship & Music", value: 25, color: "#3b82f6" },
  { name: "Outreach & Missions", value: 22, color: "#10b981" },
  { name: "Prayer Ministry", value: 20, color: "#f59e0b" },
  { name: "Children's Ministry", value: 18, color: "#ef4444" },
  { name: "Youth Ministry", value: 15, color: "#8b5cf6" },
  { name: "Adult Education", value: 12, color: "#06b6d4" },
]

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || dept.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const totalMembers = departments.reduce((sum, dept) => sum + dept.members, 0)
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0)
  const totalActivities = departments.reduce((sum, dept) => sum + dept.activities, 0)
  const averageGrowth = departments.reduce((sum, dept) => sum + dept.growth, 0) / departments.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage church departments and ministries</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>Create a new ministry department</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-name">Department Name</Label>
                <Input id="dept-name" placeholder="Enter department name" />
              </div>
              <div>
                <Label htmlFor="dept-head">Department Head</Label>
                <Input id="dept-head" placeholder="Enter head of department" />
              </div>
              <div>
                <Label htmlFor="dept-description">Description</Label>
                <Textarea id="dept-description" placeholder="Describe the department's purpose" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dept-budget">Annual Budget</Label>
                  <Input id="dept-budget" type="number" placeholder="10000" />
                </div>
                <div>
                  <Label htmlFor="dept-status">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="growing">Growing</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Add Department</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active ministries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">This month</p>
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
                <CardTitle>Department Activities</CardTitle>
                <CardDescription>Monthly activities by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    worship: { label: "Worship", color: "#3b82f6" },
                    children: { label: "Children", color: "#10b981" },
                    youth: { label: "Youth", color: "#f59e0b" },
                    outreach: { label: "Outreach", color: "#ef4444" },
                    education: { label: "Education", color: "#8b5cf6" },
                    prayer: { label: "Prayer", color: "#06b6d4" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="worship" stroke="var(--color-worship)" strokeWidth={2} />
                      <Line type="monotone" dataKey="children" stroke="var(--color-children)" strokeWidth={2} />
                      <Line type="monotone" dataKey="youth" stroke="var(--color-youth)" strokeWidth={2} />
                      <Line type="monotone" dataKey="outreach" stroke="var(--color-outreach)" strokeWidth={2} />
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
                  config={{
                    value: { label: "Members" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={memberDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                      >
                        {memberDistribution.map((entry, index) => (
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
                <CardTitle>Budget Analysis</CardTitle>
                <CardDescription>Budget vs spending by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    budget: { label: "Budget", color: "#3b82f6" },
                    spent: { label: "Spent", color: "#10b981" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
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
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <dept.icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className={`flex items-center ${dept.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {dept.growth >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {dept.growth > 0 ? "+" : ""}
                        {dept.growth}%
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
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <dept.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                        <CardDescription>{dept.head}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={dept.status === "Active" ? "default" : "secondary"}>{dept.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Members:</span>
                      <div className="font-semibold">{dept.members}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <div className="font-semibold">${dept.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Activities:</span>
                      <div className="font-semibold">{dept.activities}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Growth:</span>
                      <div
                        className={`font-semibold flex items-center ${dept.growth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {dept.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {dept.growth > 0 ? "+" : ""}
                        {dept.growth}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
