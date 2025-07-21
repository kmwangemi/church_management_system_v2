'use client';

import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Headphones,
  Heart,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { AddPrayerRequestForm } from '@/components/forms/add-prayer-request-form';
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
const prayerRequests = [
  {
    id: 1,
    title: "Healing for John's Surgery",
    description:
      "Please pray for John Smith's upcoming heart surgery scheduled for next week. Pray for the doctors and a successful recovery.",
    category: 'Health',
    priority: 'High',
    status: 'Active',
    requester: 'Sarah Johnson',
    requesterAvatar: '/placeholder.svg?height=40&width=40',
    dateSubmitted: '2024-01-05',
    lastUpdate: '2024-01-07',
    isAnonymous: false,
    prayerCount: 23,
    updates: [
      { date: '2024-01-07', message: 'Surgery went well, now in recovery' },
    ],
  },
  {
    id: 2,
    title: 'Job Search Guidance',
    description:
      "Seeking God's guidance in finding new employment opportunities. Pray for open doors and wisdom in decision making.",
    category: 'Career',
    priority: 'Medium',
    status: 'Active',
    requester: 'Anonymous',
    requesterAvatar: null,
    dateSubmitted: '2024-01-03',
    lastUpdate: '2024-01-03',
    isAnonymous: true,
    prayerCount: 15,
    updates: [],
  },
  {
    id: 3,
    title: 'Family Reconciliation',
    description:
      "Please pray for healing and restoration in our family relationships. There has been tension and we need God's peace.",
    category: 'Family',
    priority: 'High',
    status: 'Active',
    requester: 'David Wilson',
    requesterAvatar: '/placeholder.svg?height=40&width=40',
    dateSubmitted: '2024-01-02',
    lastUpdate: '2024-01-06',
    isAnonymous: false,
    prayerCount: 31,
    updates: [
      {
        date: '2024-01-06',
        message: 'Had a good conversation with my brother, progress being made',
      },
    ],
  },
  {
    id: 4,
    title: 'Thanksgiving for New Baby',
    description:
      'Praise God for the safe arrival of our baby daughter! Thank you for all the prayers during pregnancy.',
    category: 'Thanksgiving',
    priority: 'Low',
    status: 'Answered',
    requester: 'Emily Davis',
    requesterAvatar: '/placeholder.svg?height=40&width=40',
    dateSubmitted: '2023-12-20',
    lastUpdate: '2024-01-01',
    isAnonymous: false,
    prayerCount: 45,
    updates: [
      {
        date: '2024-01-01',
        message:
          "Baby arrived safely on New Year's Day! Thank you for all prayers.",
      },
    ],
  },
];

const prayerTeam = [
  {
    id: 1,
    name: 'Pastor Michael Brown',
    role: 'Prayer Team Leader',
    avatar: '/placeholder.svg?height=40&width=40',
    email: 'pastor.mike@church.com',
    phone: '+1 (555) 123-4567',
    availability: 'Daily',
    specialties: ['Healing', 'Leadership'],
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Intercessor',
    avatar: '/placeholder.svg?height=40&width=40',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    availability: 'Weekdays',
    specialties: ['Family', 'Youth'],
  },
  {
    id: 3,
    name: 'David Wilson',
    role: 'Prayer Coordinator',
    avatar: '/placeholder.svg?height=40&width=40',
    email: 'david.w@email.com',
    phone: '+1 (555) 345-6789',
    availability: 'Evenings',
    specialties: ['Career', 'Finance'],
  },
];

export default function PrayerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('requests');
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);

  const filteredRequests = prayerRequests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'Answered':
        return <Badge className="bg-green-100 text-green-800">Answered</Badge>;
      case 'Closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    totalRequests: prayerRequests.length,
    activeRequests: prayerRequests.filter((r) => r.status === 'Active').length,
    answeredRequests: prayerRequests.filter((r) => r.status === 'Answered')
      .length,
    totalPrayers: prayerRequests.reduce((sum, r) => sum + r.prayerCount, 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Prayer Requests</h1>
          <p className="mt-1 text-gray-600">
            Manage and track prayer requests from church members
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog onOpenChange={setIsAddRequestOpen} open={isAddRequestOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Prayer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Prayer Request</DialogTitle>
                <DialogDescription>
                  Submit a new prayer request for the church community
                </DialogDescription>
              </DialogHeader>
              <AddPrayerRequestForm
                onSuccess={() => setIsAddRequestOpen(false)}
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
              Total Requests
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <Headphones className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-gray-900">
              {stats.totalRequests}
            </div>
            <p className="mt-1 text-gray-500 text-xs">All time</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Active Requests
            </CardTitle>
            <div className="rounded-lg bg-orange-100 p-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-orange-600">
              {stats.activeRequests}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Needs prayer</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Answered Prayers
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {stats.answeredRequests}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Praise reports</p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-gray-600 text-sm">
              Total Prayers
            </CardTitle>
            <div className="rounded-lg bg-purple-100 p-2">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">
              {stats.totalPrayers}
            </div>
            <p className="mt-1 text-gray-500 text-xs">Community prayers</p>
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
                placeholder="Search prayer requests..."
                value={searchTerm}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs onValueChange={setSelectedTab} value={selectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requests">Prayer Requests</TabsTrigger>
              <TabsTrigger value="team">Prayer Team</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="requests">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prayers</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow className="hover:bg-gray-50" key={request.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {request.title}
                            </div>
                            <div className="max-w-xs truncate text-gray-500 text-sm">
                              {request.description}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!request.isAnonymous &&
                                request.requesterAvatar && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      alt={request.requester}
                                      src={
                                        request.requesterAvatar ||
                                        '/placeholder.svg'
                                      }
                                    />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                      {request.requester
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              <span className="text-gray-500 text-sm">
                                {request.isAnonymous
                                  ? 'Anonymous'
                                  : request.requester}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              {request.prayerCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(
                                request.dateSubmitted
                              ).toLocaleDateString()}
                            </span>
                          </div>
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
                                <Heart className="mr-2 h-4 w-4" />
                                Pray for This
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Add Update
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Answered
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Request
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

            <TabsContent className="mt-6" value="team">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {prayerTeam.map((member) => (
                  <Card
                    className="transition-shadow hover:shadow-lg"
                    key={member.id}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
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
                          <CardTitle className="text-lg">
                            {member.name}
                          </CardTitle>
                          <Badge className="mt-1" variant="outline">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <p className="text-gray-600">
                          <strong>Email:</strong> {member.email}
                        </p>
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {member.phone}
                        </p>
                        <p className="text-gray-600">
                          <strong>Available:</strong> {member.availability}
                        </p>
                      </div>
                      <div>
                        <p className="mb-2 font-medium text-gray-700 text-sm">
                          Specialties:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty, index) => (
                            <Badge
                              className="text-xs"
                              key={index}
                              variant="secondary"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="analytics">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Health</span>
                        <span className="text-gray-600 text-sm">1 request</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{ width: '25%' }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Family</span>
                        <span className="text-gray-600 text-sm">1 request</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: '25%' }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Career</span>
                        <span className="text-gray-600 text-sm">1 request</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: '25%' }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Thanksgiving
                        </span>
                        <span className="text-gray-600 text-sm">1 request</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-yellow-600"
                          style={{ width: '25%' }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prayer Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">This Week</span>
                        <span className="text-gray-600 text-sm">
                          23 prayers
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: '76%' }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Last Week</span>
                        <span className="text-gray-600 text-sm">
                          31 prayers
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          Two Weeks Ago
                        </span>
                        <span className="text-gray-600 text-sm">
                          15 prayers
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gray-400"
                          style={{ width: '48%' }}
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
