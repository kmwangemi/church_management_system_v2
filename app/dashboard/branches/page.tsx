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
  Building,
  Plus,
  Search,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Phone,
  Edit,
  Trash2,
  BarChart3,
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
const branches = [
  {
    id: 1,
    name: "Main Campus",
    location: "123 Church Street, Downtown",
    pastor: "Rev. John Smith",
    phone: "(555) 123-4567",
    email: "main@church.org",
    members: 450,
    capacity: 600,
    services: 3,
    established: "1985",
    status: "Active",
    growth: 12,
  },
  {
    id: 2,
    name: "North Branch",
    location: "456 Oak Avenue, Northside",
    pastor: "Rev. Sarah Johnson",
    phone: "(555) 234-5678",
    email: "north@church.org",
    members: 280,
    capacity: 350,
    services: 2,
    established: "2010",
    status: "Active",
    growth: 8,
  },
  {
    id: 3,
    name: "South Campus",
    location: "789 Pine Road, Southside",
    pastor: "Rev. Michael Brown",
    phone: "(555) 345-6789",
    email: "south@church.org",
    members: 320,
    capacity: 400,
    services: 2,
    established: "2015",
    status: "Active",
    growth: -3,
  },
  {
    id: 4,
    name: "East Branch",
    location: "321 Elm Street, Eastside",
    pastor: "Rev. Lisa Davis",
    phone: "(555) 456-7890",
    email: "east@church.org",
    members: 180,
    capacity: 250,
    services: 2,
    established: "2020",
    status: "Growing",
    growth: 25,
  },
]

const attendanceData = [
  { month: "Jan", main: 420, north: 260, south: 300, east: 150 },
  { month: "Feb", main: 435, north: 270, south: 310, east: 160 },
  { month: "Mar", main: 445, north: 275, south: 315, east: 170 },
  { month: "Apr", main: 450, north: 280, south: 320, east: 180 },
]

const branchDistribution = [
  { name: "Main Campus", value: 450, color: "#3b82f6" },
  { name: "North Branch", value: 280, color: "#10b981" },
  { name: "South Campus", value: 320, color: "#f59e0b" },
  { name: "East Branch", value: 180, color: "#ef4444" },
]

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.pastor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || branch.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const totalMembers = branches.reduce((sum, branch) => sum + branch.members, 0)
  const totalCapacity = branches.reduce((sum, branch) => sum + branch.capacity, 0)
  const averageGrowth = branches.reduce((sum, branch) => sum + branch.growth, 0) / branches.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Church Branches</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all church locations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Create a new church branch location</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="branch-name">Branch Name</Label>
                <Input id="branch-name" placeholder="Enter branch name" />
              </div>
              <div>
                <Label htmlFor="branch-location">Location</Label>
                <Textarea id="branch-location" placeholder="Enter full address" />
              </div>
              <div>
                <Label htmlFor="branch-pastor">Lead Pastor</Label>
                <Input id="branch-pastor" placeholder="Enter pastor name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch-phone">Phone</Label>
                  <Input id="branch-phone" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="branch-capacity">Capacity</Label>
                  <Input id="branch-capacity" type="number" placeholder="300" />
                </div>
              </div>
              <div>
                <Label htmlFor="branch-email">Email</Label>
                <Input id="branch-email" type="email" placeholder="branch@church.org" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Add Branch</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalMembers / totalCapacity) * 100)}%</div>
            <p className="text-xs text-muted-foreground">{totalCapacity - totalMembers} seats available</p>
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
                <CardTitle>Branch Attendance Trends</CardTitle>
                <CardDescription>Monthly attendance across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    main: { label: "Main Campus", color: "#3b82f6" },
                    north: { label: "North Branch", color: "#10b981" },
                    south: { label: "South Campus", color: "#f59e0b" },
                    east: { label: "East Branch", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="main" stroke="var(--color-main)" strokeWidth={2} />
                      <Line type="monotone" dataKey="north" stroke="var(--color-north)" strokeWidth={2} />
                      <Line type="monotone" dataKey="south" stroke="var(--color-south)" strokeWidth={2} />
                      <Line type="monotone" dataKey="east" stroke="var(--color-east)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Distribution</CardTitle>
                <CardDescription>Members across all branches</CardDescription>
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
                        data={branchDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {branchDistribution.map((entry, index) => (
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
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Growth rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    growth: { label: "Growth Rate", color: "#3b82f6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branches}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="growth" fill="var(--color-growth)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Analysis</CardTitle>
                <CardDescription>Current vs maximum capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{branch.name}</span>
                        <span>
                          {branch.members}/{branch.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(branch.members / branch.capacity) * 100}%` }}
                        ></div>
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
                placeholder="Search branches..."
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

          {/* Branches Table */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Directory</CardTitle>
              <CardDescription>Manage all church branch locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Pastor</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {branch.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{branch.pastor}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {branch.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{branch.members}</TableCell>
                      <TableCell>{branch.capacity}</TableCell>
                      <TableCell>
                        <div className={`flex items-center ${branch.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {branch.growth >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {branch.growth > 0 ? "+" : ""}
                          {branch.growth}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.status === "Active" ? "default" : "secondary"}>{branch.status}</Badge>
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
