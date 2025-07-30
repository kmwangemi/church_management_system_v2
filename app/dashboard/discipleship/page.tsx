'use client';

import { AddDiscipleForm } from '@/components/forms/add-disciple-form';
import { AddMilestoneForm } from '@/components/forms/add-milestone-form';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Calendar,
  Download,
  Edit,
  Eye,
  Heart,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

// Mock data
const disciples = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    mentor: 'Pastor Michael Brown',
    startDate: '2023-06-15',
    currentLevel: 'Growing',
    progress: 65,
    completedClasses: 8,
    totalClasses: 12,
    lastActivity: '2024-01-05',
    milestones: ['Baptism', 'Bible Study Completion'],
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    mentor: 'David Wilson',
    startDate: '2023-09-20',
    currentLevel: 'New Convert',
    progress: 35,
    completedClasses: 4,
    totalClasses: 12,
    lastActivity: '2024-01-07',
    milestones: ['First Prayer'],
    status: 'Active',
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    avatar: '/placeholder.svg?height=40&width=40',
    mentor: 'Sarah Johnson',
    startDate: '2022-12-10',
    currentLevel: 'Mature',
    progress: 95,
    completedClasses: 12,
    totalClasses: 12,
    lastActivity: '2024-01-06',
    milestones: [
      'Baptism',
      'Bible Study Completion',
      'Leadership Training',
      'Ministry Assignment',
    ],
    status: 'Graduated',
  },
];

const classes = [
  {
    id: 1,
    title: 'New Believers Class',
    description: 'Foundation class for new converts',
    level: 'Beginner',
    duration: '8 weeks',
    instructor: 'Pastor Michael Brown',
    enrolled: 15,
    capacity: 20,
    nextSession: '2024-01-15',
    status: 'Open',
  },
  {
    id: 2,
    title: 'Bible Study Fundamentals',
    description: 'Deep dive into Bible study methods',
    level: 'Intermediate',
    duration: '12 weeks',
    instructor: 'David Wilson',
    enrolled: 12,
    capacity: 15,
    nextSession: '2024-01-20',
    status: 'Open',
  },
  {
    id: 3,
    title: 'Leadership Development',
    description: 'Training for future church leaders',
    level: 'Advanced',
    duration: '16 weeks',
    instructor: 'Pastor Michael Brown',
    enrolled: 8,
    capacity: 10,
    nextSession: '2024-02-01',
    status: 'Full',
  },
];

const milestones = [
  {
    id: 1,
    name: 'First Prayer',
    description: 'First public prayer',
    category: 'Spiritual',
    points: 10,
  },
  {
    id: 2,
    name: 'Baptism',
    description: 'Water baptism ceremony',
    category: 'Sacrament',
    points: 50,
  },
  {
    id: 3,
    name: 'Bible Study Completion',
    description: 'Completed foundational Bible study',
    category: 'Education',
    points: 30,
  },
  {
    id: 4,
    name: 'Ministry Assignment',
    description: 'Assigned to a ministry role',
    category: 'Service',
    points: 40,
  },
  {
    id: 5,
    name: 'Leadership Training',
    description: 'Completed leadership development',
    category: 'Leadership',
    points: 60,
  },
];

export default function DiscipleshipPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('disciples');
  const [isAddDiscipleDialogOpen, setIsAddDiscipleDialogOpen] = useState(false);
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = useState(false);

  const filteredDisciples = disciples.filter(
    (disciple) =>
      disciple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disciple.mentor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadge = (level: string) => {
    const colors = {
      'New Convert': 'bg-blue-100 text-blue-800',
      Growing: 'bg-green-100 text-green-800',
      Mature: 'bg-purple-100 text-purple-800',
      Leader: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge
        className={
          colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }
      >
        {level}
      </Badge>
    );
  };

  // const getStatusBadge = (status: string) => {
  //   return status === 'Active' ? (
  //     <Badge className="bg-green-100 text-green-800">Active</Badge>
  //   ) : status === 'Graduated' ? (
  //     <Badge className="bg-blue-100 text-blue-800">Graduated</Badge>
  //   ) : (
  //     <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
  //   );
  // };

  const stats = {
    totalDisciples: disciples.length,
    activeDisciples: disciples.filter((d) => d.status === 'Active').length,
    graduated: disciples.filter((d) => d.status === 'Graduated').length,
    averageProgress: Math.round(
      disciples.reduce((sum, d) => sum + d.progress, 0) / disciples.length
    ),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Discipleship Tracking
          </h1>
          <p className="mt-1 text-gray-600">
            Track spiritual growth and discipleship progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog
            onOpenChange={setIsAddMilestoneDialogOpen}
            open={isAddMilestoneDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
                <DialogDescription>
                  Create a new discipleship milestone
                </DialogDescription>
              </DialogHeader>
              <AddMilestoneForm
                onCloseDialog={() => setIsAddMilestoneDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog
            onOpenChange={setIsAddDiscipleDialogOpen}
            open={isAddDiscipleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Disciple
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Disciple</DialogTitle>
                <DialogDescription>
                  Add a new person to the discipleship program
                </DialogDescription>
              </DialogHeader>
              <AddDiscipleForm
                onCloseDialog={() => setIsAddDiscipleDialogOpen(false)}
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
              Total Disciples
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-gray-900">
              {stats.totalDisciples}
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              In discipleship program
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Active Disciples
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.activeDisciples}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Currently active</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Graduated
            </CardTitle>
            <div className="rounded-lg bg-purple-100 p-2">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">
              {stats.graduated}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Completed program</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Average Progress
            </CardTitle>
            <div className="rounded-lg bg-orange-100 p-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">
              {stats.averageProgress}%
            </div>
            <p className="mt-1 text-gray-500 text-xs">Overall progress</p>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search disciples, mentors, or classes..."
                value={searchTerm}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setSelectedTab} value={selectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="disciples">Disciples</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-6" value="disciples">
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
                      <TableRow className="hover:bg-gray-50" key={disciple.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                alt={disciple.name}
                                src={disciple.avatar || '/placeholder.svg'}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {disciple.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {disciple.name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {disciple.email}
                              </div>
                              <div className="text-gray-500 text-sm">
                                Started:{' '}
                                {new Date(
                                  disciple.startDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">
                            {disciple.mentor}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(disciple.currentLevel)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{disciple.progress}%</span>
                            </div>
                            <Progress
                              className="h-2"
                              value={disciple.progress}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {disciple.completedClasses}/
                              {disciple.totalClasses}
                            </span>
                            <p className="text-gray-500">classes completed</p>
                          </div>
                        </TableCell>
                        {/* <TableCell>{getStatusBadge(disciple.status)}</TableCell> */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0" variant="ghost">
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
            <TabsContent className="mt-6" value="classes">
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
                      <TableRow className="hover:bg-gray-50" key={classItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {classItem.title}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {classItem.description}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Duration: {classItem.duration}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classItem.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">
                            {classItem.instructor}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {classItem.enrolled}/{classItem.capacity}
                            </span>
                            <div className="mt-1 h-1 w-16 rounded-full bg-gray-200">
                              <div
                                className="h-1 rounded-full bg-blue-600"
                                style={{
                                  width: `${(classItem.enrolled / classItem.capacity) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(
                                classItem.nextSession
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              classItem.status === 'Open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                            variant={
                              classItem.status === 'Open'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {classItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-8 w-8 p-0" variant="ghost">
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
            <TabsContent className="mt-6" value="milestones">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {milestones.map((milestone) => (
                  <Card
                    className="transition-shadow hover:shadow-lg"
                    key={milestone.id}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="rounded-lg bg-yellow-100 p-2">
                            <Star className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {milestone.name}
                            </CardTitle>
                            <Badge className="mt-1" variant="outline">
                              {milestone.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600 text-lg">
                            {milestone.points}
                          </div>
                          <div className="text-gray-500 text-xs">points</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent className="mt-6" value="analytics">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          New Converts
                        </span>
                        <span className="text-gray-600 text-sm">1 person</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: '33%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Growing</span>
                        <span className="text-gray-600 text-sm">1 person</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: '33%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Mature</span>
                        <span className="text-gray-600 text-sm">1 person</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: '33%' }}
                        />
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
                        <span className="font-medium text-sm">Baptisms</span>
                        <span className="text-gray-600 text-sm">
                          2 this month
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: '67%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Class Completions
                        </span>
                        <span className="text-gray-600 text-sm">
                          1 this month
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: '33%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Ministry Assignments
                        </span>
                        <span className="text-gray-600 text-sm">
                          1 this month
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: '33%' }}
                        />
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
  );
}
