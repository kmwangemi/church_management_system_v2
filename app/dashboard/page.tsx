"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Calendar,
  DollarSign,
  UserPlus,
  CalendarDays,
  Building,
  Heart,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
} from "lucide-react"

interface User {
  name: string
  role: string
  churchName?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "This Week's Attendance",
      value: "856",
      change: "+5%",
      trend: "up",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Monthly Giving",
      value: "$45,231",
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Events",
      value: "12",
      change: "-2",
      trend: "down",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "member",
      title: "New member registered",
      description: "Sarah Johnson joined the church",
      time: "2h ago",
      color: "bg-green-500",
    },
    {
      id: 2,
      type: "event",
      title: "Event created",
      description: "Youth Conference scheduled for next month",
      time: "4h ago",
      color: "bg-blue-500",
    },
    {
      id: 3,
      type: "finance",
      title: "Offering recorded",
      description: "Sunday service offering: $2,450",
      time: "1d ago",
      color: "bg-purple-500",
    },
    {
      id: 4,
      type: "prayer",
      title: "Prayer request submitted",
      description: "New prayer request needs attention",
      time: "2d ago",
      color: "bg-orange-500",
    },
    {
      id: 5,
      type: "asset",
      title: "Asset maintenance scheduled",
      description: "Church bus maintenance due next week",
      time: "3d ago",
      color: "bg-red-500",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Sunday Service",
      location: "Main sanctuary",
      time: "9:00 AM",
      date: "Tomorrow",
      attendees: 450,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      title: "Bible Study",
      location: "Fellowship hall",
      time: "7:00 PM",
      date: "Wednesday",
      attendees: 85,
      icon: Heart,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      title: "Youth Meeting",
      location: "Youth center",
      time: "6:00 PM",
      date: "Friday",
      attendees: 120,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const quickActions = [
    {
      title: "Add New Member",
      description: "Register a new church member",
      icon: UserPlus,
      href: "/dashboard/members",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Create Event",
      description: "Schedule a new church event",
      icon: CalendarDays,
      href: "/dashboard/events",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      title: "Record Offering",
      description: "Log financial contributions",
      icon: DollarSign,
      href: "/dashboard/finance",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      title: "Manage Assets",
      description: "Update church assets and properties",
      icon: Building,
      href: "/dashboard/assets",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋</h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening at {user?.churchName || "your church"} today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change} from last month
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1 rounded">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start h-auto p-4 ${action.color}`}
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-start space-x-3">
                      <action.icon className="h-5 w-5 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="bg-green-100 p-1 rounded">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="bg-purple-100 p-1 rounded">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <span>Upcoming Events</span>
          </CardTitle>
          <CardDescription>Events scheduled for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${event.color}`}>
                    <event.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{event.date}</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} expected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Church Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Weekly attendance over the last month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Week 1</span>
                <span className="text-sm text-gray-600">820 people</span>
              </div>
              <Progress value={85} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Week 2</span>
                <span className="text-sm text-gray-600">856 people</span>
              </div>
              <Progress value={89} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Week 3</span>
                <span className="text-sm text-gray-600">792 people</span>
              </div>
              <Progress value={82} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Week 4</span>
                <span className="text-sm text-gray-600">901 people</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ministry Health</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">New Members</span>
                  <span className="text-sm text-gray-600">15 this month</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Volunteer Engagement</span>
                  <span className="text-sm text-gray-600">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Giving Goal</span>
                  <span className="text-sm text-gray-600">$45K / $50K</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Prayer Requests</span>
                  <span className="text-sm text-gray-600">23 active</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
