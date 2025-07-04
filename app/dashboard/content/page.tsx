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
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  Video,
  Mic,
  ImageIcon,
  BookOpen,
} from "lucide-react"
import { AddContentForm } from "@/components/forms/add-content-form"

// Mock data
const content = [
  {
    id: 1,
    title: "Sunday Service - January 7, 2024",
    type: "Sermon",
    category: "Audio",
    description: "Message on 'Walking in Faith' from Hebrews 11",
    author: "Pastor Michael Brown",
    dateCreated: "2024-01-07",
    status: "Published",
    views: 234,
    downloads: 45,
    duration: "45 minutes",
    fileSize: "42.3 MB",
    tags: ["Faith", "Hebrews", "Sunday Service"],
  },
  {
    id: 2,
    title: "Youth Conference 2024 Highlights",
    type: "Video",
    category: "Event",
    description: "Highlights from the annual youth conference with testimonies and worship",
    author: "Sarah Johnson",
    dateCreated: "2024-01-05",
    status: "Published",
    views: 156,
    downloads: 23,
    duration: "12 minutes",
    fileSize: "125.7 MB",
    tags: ["Youth", "Conference", "Testimonies"],
  },
  {
    id: 3,
    title: "Bible Study Guide - Romans Chapter 8",
    type: "Document",
    category: "Study Material",
    description: "Comprehensive study guide for Romans 8 with discussion questions",
    author: "David Wilson",
    dateCreated: "2024-01-03",
    status: "Published",
    views: 89,
    downloads: 67,
    duration: "N/A",
    fileSize: "2.1 MB",
    tags: ["Bible Study", "Romans", "Study Guide"],
  },
  {
    id: 4,
    title: "Christmas Service Photos",
    type: "Gallery",
    category: "Photos",
    description: "Photo gallery from Christmas Eve and Christmas Day services",
    author: "Emily Davis",
    dateCreated: "2023-12-26",
    status: "Published",
    views: 345,
    downloads: 89,
    duration: "N/A",
    fileSize: "156.8 MB",
    tags: ["Christmas", "Photos", "Service"],
  },
  {
    id: 5,
    title: "New Member Orientation Handbook",
    type: "Document",
    category: "Resource",
    description: "Complete handbook for new church members with policies and procedures",
    author: "Pastor Michael Brown",
    dateCreated: "2024-01-01",
    status: "Draft",
    views: 12,
    downloads: 3,
    duration: "N/A",
    fileSize: "5.2 MB",
    tags: ["New Members", "Handbook", "Orientation"],
  },
]

const categories = [
  { name: "Sermons", count: 45, icon: Mic },
  { name: "Bible Studies", count: 23, icon: BookOpen },
  { name: "Videos", count: 18, icon: Video },
  { name: "Photos", count: 67, icon: ImageIcon },
  { name: "Documents", count: 34, icon: FileText },
]

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isAddContentOpen, setIsAddContentOpen] = useState(false)

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "sermon":
        return <Mic className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "gallery":
        return <ImageIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Published" ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : status === "Draft" ? (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
    )
  }

  const stats = {
    totalContent: content.length,
    published: content.filter((c) => c.status === "Published").length,
    totalViews: content.reduce((sum, c) => sum + c.views, 0),
    totalDownloads: content.reduce((sum, c) => sum + c.downloads, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage sermons, videos, documents, and other church content</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export List
          </Button>
          <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
                <DialogDescription>Upload and manage new church content</DialogDescription>
              </DialogHeader>
              <AddContentForm onSuccess={() => setIsAddContentOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Content</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalContent}</div>
            <p className="text-xs text-gray-500 mt-1">All items</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-gray-500 mt-1">Live content</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
            <p className="text-xs text-gray-500 mt-1">All time views</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Downloads</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Download className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalDownloads}</div>
            <p className="text-xs text-gray-500 mt-1">Total downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <category.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">{category.count} items</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search content by title, author, or category..."
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
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(item.type)}
                              <span className="font-medium text-gray-900">{item.title}</span>
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{item.author}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{item.views} views</div>
                            <div className="text-gray-500">{item.downloads} downloads</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{new Date(item.dateCreated).toLocaleDateString()}</span>
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
                                <Eye className="mr-2 h-4 w-4" />
                                View Content
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
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

            <TabsContent value="recent" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
                  .slice(0, 6)
                  .map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>By {item.author}</span>
                          <span>{new Date(item.dateCreated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.views} views</span>
                          <span className="text-gray-600">{item.downloads} downloads</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 6)
                  .map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">{item.views} views</Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>By {item.author}</span>
                          <span>{new Date(item.dateCreated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.downloads} downloads</span>
                          <span className="text-gray-600">{item.fileSize}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sermons</span>
                        <span className="text-sm text-gray-600">234 views</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Videos</span>
                        <span className="text-sm text-gray-600">156 views</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "47%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Documents</span>
                        <span className="text-sm text-gray-600">101 views</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">January 2024</span>
                        <span className="text-sm text-gray-600">3 items</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">December 2023</span>
                        <span className="text-sm text-gray-600">2 items</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "40%" }}></div>
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
