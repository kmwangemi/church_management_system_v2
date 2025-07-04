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
  MessageSquare,
  Mail,
  Smartphone,
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Bell,
  Download,
} from "lucide-react"
import { SendMessageForm } from "@/components/forms/send-message-form"
import { CreateAnnouncementForm } from "@/components/forms/create-announcement-form"

// Mock data
const messages = [
  {
    id: 1,
    title: "Sunday Service Reminder",
    content: "Don't forget about tomorrow's Sunday service at 9:00 AM. See you there!",
    type: "SMS",
    recipients: 456,
    status: "Sent",
    sentDate: "2024-01-06",
    sentBy: "Pastor Michael Brown",
    deliveryRate: 98.5,
  },
  {
    id: 2,
    title: "Youth Conference Registration",
    content: "Registration is now open for the Youth Conference 2024. Limited seats available!",
    type: "Email",
    recipients: 120,
    status: "Scheduled",
    sentDate: "2024-01-08",
    sentBy: "Sarah Johnson",
    deliveryRate: 0,
  },
  {
    id: 3,
    title: "Bible Study Cancelled",
    content: "Tonight's Bible study has been cancelled due to weather conditions. Stay safe!",
    type: "SMS",
    recipients: 85,
    status: "Sent",
    sentDate: "2024-01-03",
    sentBy: "David Wilson",
    deliveryRate: 96.2,
  },
]

const announcements = [
  {
    id: 1,
    title: "New Church Building Fund",
    content: "We are excited to announce the launch of our new building fund campaign...",
    category: "General",
    priority: "High",
    publishDate: "2024-01-05",
    expiryDate: "2024-03-05",
    status: "Published",
    views: 234,
    author: "Pastor Michael Brown",
  },
  {
    id: 2,
    title: "Youth Ministry Leadership Positions",
    content: "We are looking for dedicated young adults to join our youth ministry team...",
    category: "Youth",
    priority: "Medium",
    publishDate: "2024-01-04",
    expiryDate: "2024-02-04",
    status: "Published",
    views: 89,
    author: "Sarah Johnson",
  },
  {
    id: 3,
    title: "Christmas Service Schedule",
    content: "Special Christmas service times and events for the holiday season...",
    category: "Events",
    priority: "High",
    publishDate: "2023-12-15",
    expiryDate: "2023-12-26",
    status: "Expired",
    views: 567,
    author: "Emily Davis",
  },
]

const templates = [
  {
    id: 1,
    name: "Service Reminder",
    type: "SMS",
    content: "Reminder: {service_name} is tomorrow at {time}. We look forward to seeing you!",
    category: "Reminders",
    usageCount: 45,
  },
  {
    id: 2,
    name: "Event Registration",
    type: "Email",
    content: "Registration is now open for {event_name}. Click here to register: {registration_link}",
    category: "Events",
    usageCount: 23,
  },
  {
    id: 3,
    name: "Welcome New Member",
    type: "Email",
    content: "Welcome to our church family, {member_name}! We're excited to have you join us.",
    category: "Welcome",
    usageCount: 12,
  },
]

export default function CommunicationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("messages")
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent":
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const stats = {
    totalMessages: messages.length,
    sentToday: messages.filter((m) => m.sentDate === new Date().toISOString().split("T")[0]).length,
    activeAnnouncements: announcements.filter((a) => a.status === "Published").length,
    totalRecipients: messages.reduce((sum, m) => sum + m.recipients, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-1">Send messages, manage announcements, and communicate with members</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Create a new announcement for the member board</DialogDescription>
              </DialogHeader>
              <CreateAnnouncementForm onSuccess={() => setIsAnnouncementOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
                <DialogDescription>Send SMS or Email to church members</DialogDescription>
              </DialogHeader>
              <SendMessageForm onSuccess={() => setIsSendMessageOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sent Today</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Send className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sentToday}</div>
            <p className="text-xs text-gray-500 mt-1">Messages today</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Announcements</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeAnnouncements}</div>
            <p className="text-xs text-gray-500 mt-1">Currently published</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Recipients</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalRecipients}</div>
            <p className="text-xs text-gray-500 mt-1">Messages delivered</p>
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
                placeholder="Search messages, announcements, or templates..."
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
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Rate</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{message.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{message.content}</div>
                            <div className="text-sm text-gray-500">By: {message.sentBy}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {message.type === "SMS" ? (
                              <Smartphone className="h-4 w-4 text-green-600" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                            <Badge variant="outline">{message.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{message.recipients}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(message.status)}</TableCell>
                        <TableCell>
                          {message.status === "Sent" ? (
                            <span className="text-green-600 font-medium">{message.deliveryRate}%</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(message.sentDate).toLocaleDateString()}</span>
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
                                <Edit className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

            <TabsContent value="announcements" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Announcement</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{announcement.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{announcement.content}</div>
                            <div className="text-sm text-gray-500">By: {announcement.author}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{announcement.category}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={announcement.status === "Published" ? "default" : "secondary"}
                            className={
                              announcement.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : announcement.status === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {announcement.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span>{announcement.views}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(announcement.publishDate).toLocaleDateString()}</span>
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
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

            <TabsContent value="templates" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="font-medium text-gray-900">{template.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {template.type === "SMS" ? (
                              <Smartphone className="h-4 w-4 text-green-600" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{template.usageCount} times</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500 truncate max-w-xs">{template.content}</span>
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
                                <Send className="mr-2 h-4 w-4" />
                                Use Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Message Delivery Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SMS Messages</span>
                        <span className="text-sm text-gray-600">97.3%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "97%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email Messages</span>
                        <span className="text-sm text-gray-600">94.8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Communication Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">This Week</span>
                        <span className="text-sm text-gray-600">23 messages</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "76%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Week</span>
                        <span className="text-sm text-gray-600">18 messages</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: "60%" }}></div>
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
