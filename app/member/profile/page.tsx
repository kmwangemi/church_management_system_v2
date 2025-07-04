"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Calendar, Edit, Save, Camera, Heart, Users, Award, Clock } from "lucide-react"

export default function MemberProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    dateOfBirth: "1985-06-15",
    maritalStatus: "Married",
    occupation: "Software Engineer",
    emergencyContact: "Jane Doe - (555) 987-6543",
    bio: "Passionate about serving God and the community. Love spending time with family and volunteering at church events.",
    interests: ["Bible Study", "Youth Ministry", "Music", "Community Service"],
    skills: ["Teaching", "Music", "Technology", "Leadership"],
  })

  const membershipInfo = {
    memberSince: "2020-03-15",
    membershipStatus: "Active",
    baptismDate: "2020-06-15",
    smallGroups: ["Young Adults", "Bible Study Group"],
    ministries: ["Youth Ministry", "Music Team"],
    roles: ["Small Group Leader", "Worship Team Member"],
  }

  const spiritualGrowth = {
    bibleReadingStreak: 45,
    prayerPartner: "Sarah Johnson",
    currentStudy: "Book of Romans",
    mentoring: ["Mike Wilson", "Lisa Chen"],
    achievements: [
      { title: "Bible Study Graduate", date: "2023-12-10" },
      { title: "Leadership Training", date: "2023-08-15" },
      { title: "Volunteer of the Month", date: "2023-05-01" },
    ],
  }

  const handleSave = () => {
    // Save profile data
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {profileData.firstName[0]}
                  {profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {membershipInfo.membershipStatus}
                </Badge>
                {membershipInfo.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(membershipInfo.memberSince).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="spiritual">Spiritual Growth</TabsTrigger>
          <TabsTrigger value="involvement">Church Involvement</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={profileData.maritalStatus}
                    onValueChange={(value) => setProfileData({ ...profileData, maritalStatus: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={profileData.occupation}
                  onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Information */}
        <TabsContent value="membership">
          <Card>
            <CardHeader>
              <CardTitle>Membership Information</CardTitle>
              <CardDescription>Your church membership details and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                    <p className="text-lg font-semibold">{new Date(membershipInfo.memberSince).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Baptism Date</Label>
                    <p className="text-lg font-semibold">{new Date(membershipInfo.baptismDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Membership Status</Label>
                    <Badge className="bg-green-100 text-green-800 mt-1">{membershipInfo.membershipStatus}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Small Groups</Label>
                    <div className="space-y-2">
                      {membershipInfo.smallGroups.map((group) => (
                        <Badge key={group} variant="outline" className="mr-2">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Ministries</Label>
                    <div className="space-y-2">
                      {membershipInfo.ministries.map((ministry) => (
                        <Badge key={ministry} variant="outline" className="mr-2">
                          {ministry}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Current Roles</Label>
                    <div className="space-y-2">
                      {membershipInfo.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="mr-2">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiritual Growth */}
        <TabsContent value="spiritual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Spiritual Journey</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bible Reading Streak</p>
                    <p className="text-sm text-gray-600">Consecutive days</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{spiritualGrowth.bibleReadingStreak}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Prayer Partner</Label>
                  <p className="font-medium">{spiritualGrowth.prayerPartner}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Study</Label>
                  <p className="font-medium">{spiritualGrowth.currentStudy}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Mentoring</Label>
                  {spiritualGrowth.mentoring.map((person) => (
                    <Badge key={person} variant="outline" className="mr-2 mb-1">
                      {person}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spiritualGrowth.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Church Involvement */}
        <TabsContent value="involvement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Small Groups & Ministries</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Active Small Groups</h4>
                  {membershipInfo.smallGroups.map((group) => (
                    <div key={group} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                      <span>{group}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Ministry Involvement</h4>
                  {membershipInfo.ministries.map((ministry) => (
                    <div key={ministry} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                      <span>{ministry}</span>
                      <Badge variant="outline">Member</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Service Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">124</div>
                  <p className="text-sm text-green-700">Total volunteer hours this year</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Youth Ministry</span>
                    <span className="font-medium">45 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Music Team</span>
                    <span className="font-medium">32 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community Outreach</span>
                    <span className="font-medium">28 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Small Group Leadership</span>
                    <span className="font-medium">19 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
