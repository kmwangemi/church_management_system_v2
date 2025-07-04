"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  DollarSign,
  Users,
  Heart,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Gift,
  BookOpen,
  Star,
  Award,
  Target,
} from "lucide-react"

export default function MemberDashboard() {
  const memberStats = {
    totalGiving: 2450,
    attendanceRate: 85,
    eventsAttended: 12,
    prayerRequests: 3,
    smallGroups: 2,
    volunteerHours: 24,
  }

  const upcomingEvents = [
    {
      id: 1,
      title: "Sunday Service",
      date: "2024-01-07",
      time: "10:00 AM",
      location: "Main Sanctuary",
      registered: true,
    },
    {
      id: 2,
      title: "Bible Study Group",
      date: "2024-01-09",
      time: "7:00 PM",
      location: "Room 201",
      registered: true,
    },
    {
      id: 3,
      title: "Youth Fellowship",
      date: "2024-01-12",
      time: "6:00 PM",
      location: "Youth Hall",
      registered: false,
    },
  ]

  const recentAnnouncements = [
    {
      id: 1,
      title: "New Year Prayer Week",
      content: "Join us for a week of prayer and fasting starting January 8th...",
      date: "2024-01-05",
      priority: "high",
    },
    {
      id: 2,
      title: "Volunteer Opportunity",
      content: "We need volunteers for the upcoming community outreach program...",
      date: "2024-01-04",
      priority: "medium",
    },
  ]

  const spiritualMilestones = [
    { title: "Baptism", date: "2020-06-15", completed: true },
    { title: "First Communion", date: "2020-08-20", completed: true },
    { title: "Bible Study Completion", date: "2023-12-10", completed: true },
    { title: "Leadership Training", date: "2024-03-15", completed: false },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-blue-100">{"Here's what's happening in your spiritual journey"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Member since</p>
            <p className="text-lg font-semibold">March 2020</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Giving</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${memberStats.totalGiving.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.attendanceRate}%</div>
            <Progress value={memberStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.eventsAttended}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.volunteerHours}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>Events you're registered for or might be interested in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {event.registered ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Registered
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Register
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Events
            </Button>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Recent Announcements</span>
            </CardTitle>
            <CardDescription>Latest updates from your church</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{announcement.title}</h4>
                  <Badge variant={announcement.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                <p className="text-xs text-gray-400">{new Date(announcement.date).toLocaleDateString()}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Announcements
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spiritual Journey */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Spiritual Milestones</span>
            </CardTitle>
            <CardDescription>Track your spiritual growth and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {spiritualMilestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {milestone.completed ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${milestone.completed ? "text-gray-900" : "text-gray-500"}`}>
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {milestone.completed ? "Completed" : "Upcoming"} - {new Date(milestone.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Gift className="mr-2 h-4 w-4" />
              Make a Contribution
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Submit Prayer Request
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Join Small Group
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Register for Event
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Contact Pastor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
