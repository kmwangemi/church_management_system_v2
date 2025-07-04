"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, UserPlus, UserMinus, BookOpen, CalendarIcon } from "lucide-react"

interface SmallGroup {
  id: string
  name: string
  description: string
  category: string
  leader: {
    name: string
    avatar?: string
    phone: string
    email: string
  }
  meetingDay: string
  meetingTime: string
  location: string
  currentStudy: string
  capacity: number
  currentMembers: number
  isJoined: boolean
  nextMeeting: string
  tags: string[]
}

interface GroupMeeting {
  id: string
  groupName: string
  date: string
  time: string
  location: string
  topic: string
}

export default function SmallGroupsPage() {
  const [groups, setGroups] = useState<SmallGroup[]>([])
  const [myGroups, setMyGroups] = useState<SmallGroup[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<GroupMeeting[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dayFilter, setDayFilter] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState<SmallGroup | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockGroups: SmallGroup[] = [
      {
        id: "1",
        name: "Young Adults Bible Study",
        description:
          "A vibrant community of young adults exploring God's word together through interactive discussions and fellowship.",
        category: "Bible Study",
        leader: {
          name: "Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: "+1 (555) 123-4567",
          email: "sarah.j@email.com",
        },
        meetingDay: "Wednesday",
        meetingTime: "7:00 PM",
        location: "Room 201, Main Building",
        currentStudy: "Book of Romans",
        capacity: 15,
        currentMembers: 12,
        isJoined: true,
        nextMeeting: "2024-01-10",
        tags: ["Bible Study", "Young Adults", "Fellowship"],
      },
      {
        id: "2",
        name: "Men's Prayer Group",
        description: "Men gathering weekly to pray, share testimonies, and support each other in their faith journey.",
        category: "Prayer",
        leader: {
          name: "Michael Davis",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: "+1 (555) 234-5678",
          email: "michael.d@email.com",
        },
        meetingDay: "Saturday",
        meetingTime: "6:30 AM",
        location: "Fellowship Hall",
        currentStudy: "The Power of Prayer",
        capacity: 20,
        currentMembers: 8,
        isJoined: false,
        nextMeeting: "2024-01-13",
        tags: ["Prayer", "Men", "Early Morning"],
      },
      {
        id: "3",
        name: "Women's Life Group",
        description: "A supportive community of women studying scripture and sharing life experiences together.",
        category: "Life Group",
        leader: {
          name: "Jennifer Wilson",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: "+1 (555) 345-6789",
          email: "jennifer.w@email.com",
        },
        meetingDay: "Thursday",
        meetingTime: "10:00 AM",
        location: "Room 105, Education Wing",
        currentStudy: "Proverbs 31 Woman",
        capacity: 12,
        currentMembers: 10,
        isJoined: true,
        nextMeeting: "2024-01-11",
        tags: ["Life Group", "Women", "Morning"],
      },
      {
        id: "4",
        name: "Couples Connection",
        description: "Married couples strengthening their relationships through biblical principles and fellowship.",
        category: "Marriage",
        leader: {
          name: "David & Lisa Brown",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: "+1 (555) 456-7890",
          email: "browns@email.com",
        },
        meetingDay: "Friday",
        meetingTime: "7:30 PM",
        location: "Room 301, Family Center",
        currentStudy: "Love & Respect",
        capacity: 16,
        currentMembers: 14,
        isJoined: false,
        nextMeeting: "2024-01-12",
        tags: ["Marriage", "Couples", "Evening"],
      },
      {
        id: "5",
        name: "Youth Discipleship",
        description: "High school students diving deep into discipleship and leadership development.",
        category: "Youth",
        leader: {
          name: "Pastor Mark Thompson",
          avatar: "/placeholder.svg?height=40&width=40",
          phone: "+1 (555) 567-8901",
          email: "mark.t@email.com",
        },
        meetingDay: "Sunday",
        meetingTime: "4:00 PM",
        location: "Youth Center",
        currentStudy: "Radical Discipleship",
        capacity: 25,
        currentMembers: 18,
        isJoined: false,
        nextMeeting: "2024-01-14",
        tags: ["Youth", "Discipleship", "Leadership"],
      },
    ]

    const mockMeetings: GroupMeeting[] = [
      {
        id: "1",
        groupName: "Young Adults Bible Study",
        date: "2024-01-10",
        time: "7:00 PM",
        location: "Room 201",
        topic: "Romans 8: Life in the Spirit",
      },
      {
        id: "2",
        groupName: "Women's Life Group",
        date: "2024-01-11",
        time: "10:00 AM",
        location: "Room 105",
        topic: "Strength and Dignity",
      },
      {
        id: "3",
        groupName: "Men's Prayer Group",
        date: "2024-01-13",
        time: "6:30 AM",
        location: "Fellowship Hall",
        topic: "Praying for Our Families",
      },
    ]

    setGroups(mockGroups)
    setMyGroups(mockGroups.filter((group) => group.isJoined))
    setUpcomingMeetings(mockMeetings)
    setLoading(false)
  }, [])

  const handleJoinGroup = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, isJoined: true, currentMembers: group.currentMembers + 1 } : group,
      ),
    )
    const joinedGroup = groups.find((group) => group.id === groupId)
    if (joinedGroup) {
      setMyGroups([...myGroups, { ...joinedGroup, isJoined: true }])
    }
  }

  const handleLeaveGroup = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, isJoined: false, currentMembers: group.currentMembers - 1 } : group,
      ),
    )
    setMyGroups(myGroups.filter((group) => group.id !== groupId))
  }

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.leader.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter
    const matchesDay = dayFilter === "all" || group.meetingDay === dayFilter

    return matchesSearch && matchesCategory && matchesDay
  })

  const categories = ["all", ...Array.from(new Set(groups.map((group) => group.category)))]
  const days = ["all", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Small Groups</h1>
          <p className="text-gray-600 mt-1">Connect, grow, and build relationships in community</p>
        </div>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search Groups</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, or leader..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day">Meeting Day</Label>
                  <Select value={dayFilter} onValueChange={setDayFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day === "all" ? "Any Day" : day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {group.category}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {group.currentMembers}/{group.capacity}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {group.meetingDay}s at {group.meetingTime}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {group.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {group.currentStudy}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={group.leader.avatar || "/placeholder.svg"} alt={group.leader.name} />
                      <AvatarFallback>
                        {group.leader.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{group.leader.name}</p>
                      <p className="text-xs text-gray-500">Group Leader</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {group.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{group.name}</DialogTitle>
                          <DialogDescription>{group.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium">Meeting Time</Label>
                              <p>
                                {group.meetingDay}s at {group.meetingTime}
                              </p>
                            </div>
                            <div>
                              <Label className="font-medium">Location</Label>
                              <p>{group.location}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Current Study</Label>
                              <p>{group.currentStudy}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Capacity</Label>
                              <p>
                                {group.currentMembers}/{group.capacity} members
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label className="font-medium">Group Leader</Label>
                            <div className="flex items-center space-x-3 mt-2">
                              <Avatar>
                                <AvatarImage src={group.leader.avatar || "/placeholder.svg"} alt={group.leader.name} />
                                <AvatarFallback>
                                  {group.leader.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{group.leader.name}</p>
                                <p className="text-sm text-gray-500">{group.leader.email}</p>
                                <p className="text-sm text-gray-500">{group.leader.phone}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {group.isJoined ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleLeaveGroup(group.id)}
                                className="flex-1"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Leave Group
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleJoinGroup(group.id)}
                                disabled={group.currentMembers >= group.capacity}
                                className="flex-1"
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                {group.currentMembers >= group.capacity ? "Group Full" : "Join Group"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {group.isJoined ? (
                      <Button variant="destructive" size="sm" onClick={() => handleLeaveGroup(group.id)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.currentMembers >= group.capacity}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-6">
          {myGroups.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {myGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {group.category}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Joined
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Next: {new Date(group.nextMeeting).toLocaleDateString()} at {group.meetingTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {group.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Currently studying: {group.currentStudy}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={group.leader.avatar || "/placeholder.svg"} alt={group.leader.name} />
                        <AvatarFallback>
                          {group.leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{group.leader.name}</p>
                        <p className="text-xs text-gray-500">Group Leader</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Contact Leader
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleLeaveGroup(group.id)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No groups joined yet</h3>
                <p className="text-gray-500 mb-4">Discover and join small groups to start building community.</p>
                <Button onClick={() => document.querySelector('[value="discover"]')?.click()}>Discover Groups</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your small group meeting schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{meeting.groupName}</h4>
                        <p className="text-sm text-gray-600">{meeting.topic}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <span>{meeting.time}</span>
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Add to Calendar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                  <p className="text-gray-500">Join a small group to see your meeting schedule.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
