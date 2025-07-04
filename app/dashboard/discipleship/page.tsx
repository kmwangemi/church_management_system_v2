"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Heart,
  Users,
  Award,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Calendar,
  TrendingUp,
  Star,
  Download,
} from "lucide-react"
import { AddDiscipleForm } from "@/components/forms/add-disciple-form"
import { AddMilestoneForm } from "@/components/forms/add-milestone-form"

// Mock data
const disciples = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    mentor: "Pastor Michael Brown",
    startDate: "2023-06-15",
    currentLevel: "Growing",
    progress: 65,
    completedClasses: 8,
    totalClasses: 12,
    lastActivity: "2024-01-05",
    milestones: ["Baptism", "Bible Study Completion"],
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    mentor: "David Wilson",
    startDate: "2023-09-20",
    currentLevel: "New Convert",
    progress: 35,
    completedClasses: 4,
    totalClasses: 12,
    lastActivity: "2024-01-07",
    milestones: ["First Prayer"],
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    avatar: "/placeholder.svg?height=40&width=40",
    mentor: "Sarah Johnson",
    startDate: "2022-12-10",
    currentLevel: "Mature",
    progress: 95,
    completedClasses: 12,
    totalClasses: 12,
    lastActivity: "2024-01-06",
    milestones: ["Baptism", "Bible Study Completion", "Leadership Training", "Ministry Assignment"],
    status: "Graduated",
  },
]

const classes = [
  {
    id: 1,
    title: "New Believers Class",
    description: "Foundation class for new converts",
    level: "Beginner",
    duration: "8 weeks",
    instructor: "Pastor Michael Brown",
    enrolled: 15,
    capacity: 20,
    nextSession: "2024-01-15",
    status: "Open",
  },
  {
    id: 2,
    title: "Bible Study Fundamentals",
    description: "Deep dive into Bible study methods",
    level: "Intermediate",
    duration: "12 weeks",
    instructor: "David Wilson",
    enrolled: 12,
    capacity: 15,
    nextSession: "2024-01-20",
    status: "Open",
  },
  {
    id: 3,
    title: "Leadership Development",
    description: "Training for future church leaders",
    level: "Advanced",
    duration: "16 weeks",
    instructor: "Pastor Michael Brown",
    enrolled: 8,
    capacity: 10,
    nextSession: "2024-02-01",
    status: "Full",
  },
]

const milestones = [
  { id: 1, name: "First Prayer", description: "First public prayer", category: "Spiritual", points: 10 },
  { id: 2, name: "Baptism", description: "Water baptism ceremony", category: "Sacrament", points: 50 },
  {
    id: 3,
    name: "Bible Study Completion",
    description: "Completed foundational Bible study",
    category: "Education",
    points: 30,
  },
  { id: 4, name: "Ministry Assignment", description: "Assigned to a ministry role", category: "Service", points: 40 },
  {
    id: 5,
    name: "Leadership Training",
    description: "Completed leadership development",
    category: "Leadership",
    points: 60,
  },
]

export default function DiscipleshipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("disciples")
  const [isAddDiscipleOpen, setIsAddDiscipleOpen] = useState(false)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)

  const filteredDisciples = disciples.filter(
    (disciple) =>
      disciple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciple.mentor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getLevelBadge = (level: string) => {
    const colors = {
      "New Convert": "bg-blue-100 text-blue-800",
      Growing: "bg-green-100 text-green-800",
      Mature: "bg-purple-100 text-purple-800",
      Leader: "bg-orange-100 text-orange-800",
    }
    return <Badge className={colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{level}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : status === "Graduated" ? (
      <Badge className="bg-blue-100 text-blue-800">Graduated</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  const stats = {
    totalDisciples: disciples.length,
    activeDisciples: disciples.filter((d) => d.status === "Active").length,
    graduated: disciples.filter((d) => d.status === "Graduated").length,
    averageProgress: Math.round(disciples.reduce((sum, d) => sum + d.progress, 0) / disciples.length),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discipleship Tracking</h1>
          <p className="text-gray-600 mt-1">Track spiritual growth and discipleship progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
                <DialogDescription>Create a new discipleship milestone</DialogDescription>
              </DialogHeader>
              <AddMilestoneForm onSuccess={() => setIsAddMilestoneOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDiscipleOpen} onOpenChange={setIsAddDiscipleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Disciple
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Disciple</DialogTitle>
                <DialogDescription>Add a new person to the discipleship program</DialogDescription>
              </DialogHeader>
              <AddDiscipleForm onSuccess={() => setIsAddDiscipleOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Disciples</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDisciples}</div>
            <p className="text-xs text-gray-500 mt-1">In discipleship program</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Disciples</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeDisciples}</div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Graduated</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.graduated}</div>
            <p className="text-xs text-gray-500 mt-1">Completed program</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.averageProgress}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search disciples, mentors, or classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="disciples">Disciples</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="disciples" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciple</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisciples.map((disciple) => (
                      <TableRow key={disciple.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={disciple.avatar || "/placeholder.svg"} alt={disciple.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {disciple.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{disciple.name}</div>
                              <div className="text-sm text-gray-500">{disciple.email}</div>
                              <div className="text-sm text-gray-500">
                                Started: {new Date(disciple.startDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{disciple.mentor}</span>
                        </TableCell>
                        <TableCell>{getLevelBadge(disciple.currentLevel)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{disciple.progress}%</span>
                            </div>
                            <Progress value={disciple.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {disciple.completedClasses}/{disciple.totalClasses}
                            </span>
                            <p className="text-gray-500">classes completed</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(disciple.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Award className="mr-2 h-4 w-4" />
                                Add Milestone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Users className="mr-2 h-4 w-4" />
                                Remove from Program
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Next Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{classItem.title}</div>
                            <div className="text-sm text-gray-500">{classItem.description}</div>
                            <div className="text-sm text-gray-500">Duration: {classItem.duration}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classItem.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{classItem.instructor}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {classItem.enrolled}/{classItem.capacity}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{new Date(classItem.nextSession).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={classItem.status === "Open" ? "default" : "secondary"}
                            className={
                              classItem.status === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {classItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Enrollment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Class
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.map((milestone) => (
                  <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{milestone.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {milestone.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{milestone.points}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">New Converts</span>
                        <span className="text-sm text-gray-600">1 person</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Growing</span>
                        <span className="text-sm text-gray-600">1 person</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Mature</span>
                        <span className="text-sm text-gray-600">1 person</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Baptisms</span>
                        <span className="text-sm text-gray-600">2 this month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Class Completions</span>
                        <span className="text-sm text-gray-600">1 this month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ministry Assignments</span>
                        <span className="text-sm text-gray-600">1 this month</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
