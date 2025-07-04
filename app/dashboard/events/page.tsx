"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  Bell,
  Download,
} from "lucide-react"
import { AddEventForm } from "@/components/forms/add-event-form"

// Mock data
const events = [
  {
    id: 1,
    title: "Sunday Morning Service",
    description: "Weekly worship service with sermon and communion",
    date: "2024-01-14",
    time: "09:00 AM",
    endTime: "11:30 AM",
    location: "Main Sanctuary",
    type: "Service",
    status: "Scheduled",
    expectedAttendees: 450,
    registeredAttendees: 0,
    organizer: "Pastor Michael Brown",
    recurring: "Weekly",
  },
  {
    id: 2,
    title: "Youth Conference 2024",
    description: "Annual youth conference with guest speakers and workshops",
    date: "2024-02-15",
    time: "06:00 PM",
    endTime: "09:00 PM",
    location: "Fellowship Hall",
    type: "Conference",
    status: "Open for Registration",
    expectedAttendees: 120,
    registeredAttendees: 67,
    organizer: "Sarah Johnson",
    recurring: "None",
  },
  {
    id: 3,
    title: "Bible Study",
    description: "Weekly Bible study and discussion",
    date: "2024-01-10",
    time: "07:00 PM",
    endTime: "08:30 PM",
    location: "Conference Room",
    type: "Study",
    status: "Completed",
    expectedAttendees: 85,
    registeredAttendees: 78,
    organizer: "David Wilson",
    recurring: "Weekly",
  },
  {
    id: 4,
    title: "Community Outreach",
    description: "Food distribution and community service",
    date: "2024-01-20",
    time: "10:00 AM",
    endTime: "02:00 PM",
    location: "Community Center",
    type: "Outreach",
    status: "Scheduled",
    expectedAttendees: 50,
    registeredAttendees: 23,
    organizer: "Emily Davis",
    recurring: "Monthly",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Scheduled":
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
    case "Open for Registration":
      return <Badge className="bg-green-100 text-green-800">Open for Registration</Badge>
    case "Completed":
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
    case "Cancelled":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getTypeBadge = (type: string) => {
  const colors = {
    Service: "bg-purple-100 text-purple-800",
    Conference: "bg-orange-100 text-orange-800",
    Study: "bg-blue-100 text-blue-800",
    Outreach: "bg-green-100 text-green-800",
    Meeting: "bg-gray-100 text-gray-800",
  }
  return <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{type}</Badge>
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())

    const eventDate = new Date(event.date)
    const today = new Date()

    if (selectedTab === "upcoming") {
      return matchesSearch && eventDate >= today
    } else if (selectedTab === "past") {
      return matchesSearch && eventDate < today
    } else if (selectedTab === "recurring") {
      return matchesSearch && event.recurring !== "None"
    }

    return matchesSearch
  })

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.date) >= new Date()).length,
    thisWeek: events.filter((e) => {
      const eventDate = new Date(e.date)
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= today && eventDate <= weekFromNow
    }).length,
    registrations: events.reduce((sum, e) => sum + e.registeredAttendees, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage church events and services</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Calendar
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Schedule a new church event or service</DialogDescription>
              </DialogHeader>
              <AddEventForm onSuccess={() => setIsAddEventOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All events</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled ahead</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.thisWeek}</div>
            <p className="text-xs text-gray-500 mt-1">Events this week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Registrations</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.registrations}</div>
            <p className="text-xs text-gray-500 mt-1">Registered attendees</p>
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
                placeholder="Search events by title, location, or organizer..."
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
              <TabsTrigger value="upcoming">Upcoming ({stats.upcoming})</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                            <div className="text-sm text-gray-500">Organizer: {event.organizer}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {event.time} - {event.endTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(event.type)}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>
                                {event.registeredAttendees} / {event.expectedAttendees}
                              </span>
                            </div>
                            {event.expectedAttendees > 0 && (
                              <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                <div
                                  className="bg-blue-600 h-1 rounded-full"
                                  style={{ width: `${(event.registeredAttendees / event.expectedAttendees) * 100}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
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
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Manage Attendance
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Reminders
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500">Try adjusting your search or create a new event.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
