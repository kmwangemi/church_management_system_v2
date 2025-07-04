"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Database,
  Server,
} from "lucide-react"

export default function SuperAdminDashboard() {
  const stats = [
    {
      name: "Total Churches",
      value: "247",
      change: "+12%",
      changeType: "positive",
      icon: Building2,
    },
    {
      name: "Total Members",
      value: "89,432",
      change: "+8.2%",
      changeType: "positive",
      icon: Users,
    },
    {
      name: "Active Branches",
      value: "1,234",
      change: "+15%",
      changeType: "positive",
      icon: MapPin,
    },
    {
      name: "Monthly Revenue",
      value: "$2.4M",
      change: "+23%",
      changeType: "positive",
      icon: DollarSign,
    },
  ]

  const topChurches = [
    { name: "Grace Community Church", members: 2450, growth: 15.2, revenue: "$45,000" },
    { name: "Faith Baptist Church", members: 1890, growth: 12.8, revenue: "$38,500" },
    { name: "Hope Methodist Church", members: 1650, growth: 10.5, revenue: "$32,000" },
    { name: "Trinity Presbyterian", members: 1420, growth: 8.9, revenue: "$28,750" },
    { name: "New Life Assembly", members: 1380, growth: 7.6, revenue: "$27,200" },
  ]

  const systemAlerts = [
    { type: "warning", message: "Database backup delayed by 2 hours", time: "2 hours ago" },
    { type: "success", message: "System update completed successfully", time: "4 hours ago" },
    { type: "info", message: "New church registration pending approval", time: "6 hours ago" },
  ]

  const recentActivities = [
    { church: "Grace Community", action: "Added 15 new members", time: "10 minutes ago" },
    { church: "Faith Baptist", action: "Created new event: Easter Service", time: "25 minutes ago" },
    { church: "Hope Methodist", action: "Updated financial records", time: "1 hour ago" },
    { church: "Trinity Presbyterian", action: "Sent weekly newsletter", time: "2 hours ago" },
  ]

  const systemHealth = [
    { name: "Server Uptime", value: 99.9, status: "excellent" },
    { name: "Database Performance", value: 95.2, status: "good" },
    { name: "API Response Time", value: 87.5, status: "good" },
    { name: "Storage Usage", value: 72.3, status: "warning" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SuperAdmin Dashboard</h1>
        <p className="text-muted-foreground">Global overview of all churches and system performance</p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center ${
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Churches */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Churches</CardTitle>
            <CardDescription>Churches ranked by growth and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topChurches.map((church, index) => (
                <div key={church.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{church.name}</p>
                      <p className="text-xs text-muted-foreground">{church.members} members</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{church.revenue}</p>
                    <p className="text-xs text-green-600">+{church.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm text-muted-foreground">{metric.value}%</span>
                  </div>
                  <Progress
                    value={metric.value}
                    className={`h-2 ${
                      metric.status === "excellent"
                        ? "bg-green-100"
                        : metric.status === "good"
                          ? "bg-blue-100"
                          : "bg-yellow-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important system notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {alert.type === "info" && <Activity className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest activities across all churches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.church}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Building2 className="mr-2 h-4 w-4" />
              Add New Church
            </Button>
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Backup Database
            </Button>
            <Button variant="outline" size="sm">
              <Server className="mr-2 h-4 w-4" />
              System Maintenance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
