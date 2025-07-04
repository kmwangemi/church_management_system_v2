"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Phone,
  Camera,
  Key,
  LogOut,
} from "lucide-react"

export default function MemberSettingsPage() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Mock user data
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    dateOfBirth: "1990-05-15",
    memberSince: "2020-01-15",
    profileImage: "/placeholder.svg?height=100&width=100",
    bio: "Passionate about serving God and building community through faith.",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543",
    },
  }

  const notificationSettings = {
    emailNotifications: {
      announcements: true,
      events: true,
      prayerRequests: false,
      givingReminders: true,
      smallGroups: true,
      newsletters: true,
    },
    pushNotifications: {
      announcements: true,
      events: true,
      prayerRequests: true,
      messages: true,
      reminders: false,
    },
    smsNotifications: {
      emergencyAlerts: true,
      eventReminders: false,
      givingReminders: false,
    },
  }

  const privacySettings = {
    profileVisibility: "members", // public, members, leaders
    showEmail: false,
    showPhone: false,
    showAddress: false,
    allowDirectMessages: true,
    showInDirectory: true,
    shareAttendanceData: true,
    shareGivingData: false,
  }

  const appPreferences = {
    theme: "system", // light, dark, system
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    dashboardLayout: "default",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {userData.firstName[0]}
                    {userData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    Remove Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={userData.firstName} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={userData.lastName} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={userData.email} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={userData.phone} />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" defaultValue={userData.dateOfBirth} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" defaultValue={userData.address} />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." defaultValue={userData.bio} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input id="emergencyName" defaultValue={userData.emergencyContact.name} />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input id="emergencyRelationship" defaultValue={userData.emergencyContact.relationship} />
                </div>
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input id="emergencyPhone" defaultValue={userData.emergencyContact.phone} />
              </div>
              <Button>Update Emergency Contact</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
              <CardDescription>Choose what email notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={`email-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {key === "announcements" && "Church announcements and updates"}
                      {key === "events" && "Upcoming events and activities"}
                      {key === "prayerRequests" && "New prayer requests from the community"}
                      {key === "givingReminders" && "Monthly giving statements and reminders"}
                      {key === "smallGroups" && "Small group updates and activities"}
                      {key === "newsletters" && "Weekly newsletters and devotionals"}
                    </p>
                  </div>
                  <Switch id={`email-${key}`} defaultChecked={value} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Push Notifications</span>
              </CardTitle>
              <CardDescription>Manage push notifications on your mobile device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notificationSettings.pushNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={`push-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {key === "announcements" && "Important church announcements"}
                      {key === "events" && "Event reminders and updates"}
                      {key === "prayerRequests" && "Urgent prayer requests"}
                      {key === "messages" && "Direct messages from church leaders"}
                      {key === "reminders" && "General reminders and notifications"}
                    </p>
                  </div>
                  <Switch id={`push-${key}`} defaultChecked={value} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>SMS Notifications</span>
              </CardTitle>
              <CardDescription>Receive important updates via text message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={`sms-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {key === "emergencyAlerts" && "Emergency alerts and urgent notifications"}
                      {key === "eventReminders" && "Reminders for upcoming events"}
                      {key === "givingReminders" && "Monthly giving reminders"}
                    </p>
                  </div>
                  <Switch id={`sms-${key}`} defaultChecked={value} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>Control who can see your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select defaultValue={privacySettings.profileVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="members">Members Only - Church members can see</SelectItem>
                    <SelectItem value="leaders">Leaders Only - Church leaders can see</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Contact Information Visibility</h4>
                {[
                  { key: "showEmail", label: "Show Email Address", value: privacySettings.showEmail },
                  { key: "showPhone", label: "Show Phone Number", value: privacySettings.showPhone },
                  { key: "showAddress", label: "Show Address", value: privacySettings.showAddress },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <Switch id={item.key} defaultChecked={item.value} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Communication & Directory</h4>
                {[
                  {
                    key: "allowDirectMessages",
                    label: "Allow Direct Messages",
                    value: privacySettings.allowDirectMessages,
                  },
                  { key: "showInDirectory", label: "Show in Member Directory", value: privacySettings.showInDirectory },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label htmlFor={item.key}>{item.label}</Label>
                    <Switch id={item.key} defaultChecked={item.value} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Sharing</h4>
                {[
                  {
                    key: "shareAttendanceData",
                    label: "Share Attendance Data",
                    description: "Allow church leaders to see your attendance patterns",
                    value: privacySettings.shareAttendanceData,
                  },
                  {
                    key: "shareGivingData",
                    label: "Share Giving Data",
                    description: "Allow financial team to see your giving history",
                    value: privacySettings.shareGivingData,
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={item.key}>{item.label}</Label>
                      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                    </div>
                    <Switch id={item.key} defaultChecked={item.value} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Keep your account secure with a strong password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsChangePasswordOpen(false)}>Update Password</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">
                    <Badge variant="outline" className="mr-2">
                      Disabled
                    </Badge>
                    Secure your account with 2FA
                  </p>
                </div>
                <Button>Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">iPhone 13 Pro</p>
                      <p className="text-sm text-gray-600">Current session • New York, NY</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-gray-600">2 hours ago • New York, NY</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue={appPreferences.theme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                <Select defaultValue={appPreferences.dashboardLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="expanded">Expanded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
              <CardDescription>Set your language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue={appPreferences.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={appPreferences.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue={appPreferences.dateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue={appPreferences.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Download your personal data and activity history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Profile Data</p>
                    <p className="text-sm text-gray-600">Personal information, contact details, and preferences</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Activity History</p>
                    <p className="text-sm text-gray-600">Attendance records, event participation, and engagement</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Giving History</p>
                    <p className="text-sm text-gray-600">Donation records and financial contributions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Prayer Requests</p>
                    <p className="text-sm text-gray-600">Your prayer requests and community interactions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your stored data and cache</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-gray-600">Remove temporary files and cached data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear Cache
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Reset Preferences</p>
                    <p className="text-sm text-gray-600">Reset all settings to default values</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Preferences</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset all your preferences to default values. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Reset Preferences</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions that affect your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                  <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete your account? This will permanently remove all
                            your data, including:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Profile information and preferences</li>
                              <li>Attendance and participation history</li>
                              <li>Prayer requests and interactions</li>
                              <li>Giving history and financial records</li>
                              <li>Small group memberships and activities</li>
                            </ul>
                            <br />
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Yes, Delete My Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
