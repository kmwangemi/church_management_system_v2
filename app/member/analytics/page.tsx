"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Calendar, DollarSign, Heart, Users, BookOpen, Award, Star } from "lucide-react"

export default function MemberAnalytics() {
  const memberStats = {
    attendanceRate: 85,
    givingGoal: 3000,
    givingProgress: 2450,
    volunteerHours: 124,
    eventsAttended: 18,
    prayerRequests: 7,
    bibleReadingStreak: 45,
    smallGroupParticipation: 92,
  }

  const attendanceData = [
    { month: "Jan", attendance: 4, services: 4 },
    { month: "Feb", attendance: 3, services: 4 },
    { month: "Mar", attendance: 4, services: 4 },
    { month: "Apr", attendance: 3, services: 4 },
    { month: "May", attendance: 4, services: 5 },
    { month: "Jun", attendance: 4, services: 4 },
    { month: "Jul", attendance: 3, services: 4 },
    { month: "Aug", attendance: 4, services: 4 },
    { month: "Sep", attendance: 4, services: 4 },
    { month: "Oct", attendance: 3, services: 4 },
    { month: "Nov", attendance: 4, services: 4 },
    { month: "Dec", attendance: 4, services: 5 },
  ]

  const givingData = [
    { month: "Jan", amount: 250 },
    { month: "Feb", amount: 200 },
    { month: "Mar", amount: 250 },
    { month: "Apr", amount: 180 },
    { month: "May", amount: 300 },
    { month: "Jun", amount: 250 },
    { month: "Jul", amount: 220 },
    { month: "Aug", amount: 250 },
    { month: "Sep", amount: 280 },
    { month: "Oct", amount: 200 },
    { month: "Nov", amount: 250 },
    { month: "Dec", amount: 270 },
  ]

  const involvementData = [
    { name: "Worship Services", value: 48, color: "#3b82f6" },
    { name: "Small Groups", value: 24, color: "#10b981" },
    { name: "Volunteer Work", value: 16, color: "#f59e0b" },
    { name: "Prayer Meetings", value: 12, color: "#ef4444" },
  ]

  const spiritualGrowthData = [
    { category: "Bible Reading", current: 45, goal: 365 },
    { category: "Prayer Time", current: 280, goal: 365 },
    { category: "Service Hours", current: 124, goal: 150 },
    { category: "Small Group", current: 22, goal: 24 },
  ]

  const achievements = [
    {
      title: "Perfect Attendance",
      description: "Attended every service in November",
      date: "2023-11-30",
      icon: Calendar,
    },
    { title: "Generous Giver", description: "Exceeded annual giving goal", date: "2023-10-15", icon: DollarSign },
    { title: "Faithful Volunteer", description: "100+ volunteer hours", date: "2023-09-20", icon: Heart },
    { title: "Bible Study Graduate", description: "Completed Romans study", date: "2023-08-10", icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.attendanceRate}%</div>
            <Progress value={memberStats.attendanceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Above church average (78%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giving Progress</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${memberStats.givingProgress.toLocaleString()}</div>
            <Progress value={(memberStats.givingProgress / memberStats.givingGoal) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              ${memberStats.givingGoal - memberStats.givingProgress} to goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.volunteerHours}</div>
            <p className="text-xs text-muted-foreground">This year • +24% from last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bible Reading</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberStats.bibleReadingStreak}</div>
            <p className="text-xs text-muted-foreground">Day streak • Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
          <TabsTrigger value="involvement">Involvement</TabsTrigger>
          <TabsTrigger value="growth">Spiritual Growth</TabsTrigger>
        </TabsList>

        {/* Attendance Analytics */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance</CardTitle>
                <CardDescription>Your service attendance throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    attendance: {
                      label: "Services Attended",
                      color: "hsl(var(--chart-1))",
                    },
                    services: {
                      label: "Total Services",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="services" fill="var(--color-services)" name="Total Services" opacity={0.3} />
                      <Bar dataKey="attendance" fill="var(--color-attendance)" name="Attended" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Insights</CardTitle>
                <CardDescription>Your attendance patterns and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Best Month</p>
                    <p className="text-sm text-green-700">Perfect attendance in March & September</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">100%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Current Streak</p>
                    <p className="text-sm text-blue-700">4 consecutive services</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-purple-900">Special Events</p>
                    <p className="text-sm text-purple-700">Attended 6 out of 8 special events</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">75%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Giving Analytics */}
        <TabsContent value="giving">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Giving</CardTitle>
                <CardDescription>Your contribution history over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={givingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--color-amount)"
                        fill="var(--color-amount)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giving Summary</CardTitle>
                <CardDescription>Your generosity impact this year</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${memberStats.givingProgress.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total given this year</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Average</span>
                    <span className="font-medium">${Math.round(memberStats.givingProgress / 12)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Largest Gift</span>
                    <span className="font-medium">$300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Giving Frequency</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Goal Progress</span>
                    <span className="font-medium">
                      {Math.round((memberStats.givingProgress / memberStats.givingGoal) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Involvement Analytics */}
        <TabsContent value="involvement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>How you spend your time at church</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Hours",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={involvementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {involvementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ministry Involvement</CardTitle>
                <CardDescription>Your active participation in church ministries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Small Group Leader</p>
                        <p className="text-sm text-gray-500">Young Adults Group</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Volunteer</p>
                        <p className="text-sm text-gray-500">Community Outreach</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Bible Study</p>
                        <p className="text-sm text-gray-500">Wednesday Evening</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Regular</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spiritual Growth */}
        <TabsContent value="growth">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Growth Goals</CardTitle>
                <CardDescription>Track your progress in key areas of spiritual development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {spiritualGrowthData.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-gray-500">
                          {item.current}/{item.goal}
                        </span>
                      </div>
                      <Progress value={(item.current / item.goal) * 100} className="h-2" />
                      <p className="text-xs text-gray-500">{Math.round((item.current / item.goal) * 100)}% complete</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Milestones in your spiritual journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
