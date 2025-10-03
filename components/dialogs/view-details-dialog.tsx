"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MapPin, Phone, Mail, Users, Calendar, TrendingUp } from 'lucide-react'

interface ViewDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "branch" | "department" | "group"
  item?: any
}

export function ViewDetailsDialog({ open, onOpenChange, type, item }: ViewDetailsDialogProps) {
  if (!item) return null

  const renderBranchDetails = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Branch Name</label>
                <p className="text-sm font-semibold">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pastor/Leader</label>
                <p className="text-sm font-semibold">{item.pastor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Established</label>
                <p className="text-sm">{item.established}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="mt-1">{item.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{item.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{item.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">{item.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="members" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{item.members}</p>
                <p className="text-sm text-gray-500">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{Math.round(item.members * 0.85)}</p>
                <p className="text-sm text-gray-500">Active Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{Math.round(item.members * 0.15)}</p>
                <p className="text-sm text-gray-500">New This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Growth Rate</label>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-lg font-semibold text-green-600">+{item.growthRate}%</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Monthly Attendance Trend</label>
                <div className="mt-2 h-4 bg-gray-200 rounded-full">
                  <div className="h-4 bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">75% average attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  const renderDepartmentDetails = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-sm font-semibold">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Head</label>
                <p className="text-sm font-semibold">{item.head}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Members</label>
                <p className="text-sm">{item.members}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="mt-1">{item.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="activities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{item.activities}</p>
            <p className="text-sm text-gray-500">Activities this month</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="budget" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${item.budget?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Annual budget allocation</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  const renderGroupDetails = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Group Name</label>
                <p className="text-sm font-semibold">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Leader</label>
                <p className="text-sm font-semibold">{item.leader}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <Badge className="mt-1">{item.category}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className="mt-1">{item.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="schedule" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Meeting Time</label>
              <p className="text-sm">{item.meetingTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-sm">{item.location}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="members" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{item.members}</p>
            <p className="text-sm text-gray-500">Current members</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {type === "branch" && "Branch Details"}
            {type === "department" && "Department Details"}
            {type === "group" && "Small Group Details"}
          </DialogTitle>
          <DialogDescription>
            View detailed information and statistics
          </DialogDescription>
        </DialogHeader>
        {type === "branch" && renderBranchDetails()}
        {type === "department" && renderDepartmentDetails()}
        {type === "group" && renderGroupDetails()}
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
