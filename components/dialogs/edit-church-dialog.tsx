"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Upload, MapPin, Building2 } from "lucide-react"

interface Church {
  id: number
  name: string
  pastor: string
  email: string
  phone: string
  website: string
  denomination: string
  members: number
  branches: number
  revenue: number
  growth: number
  status: string
  plan: string
  established: string
  lastActivity: string
  address: string
}

interface EditChurchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: Church | null
  onSave: (church: Church) => void
}

export function EditChurchDialog({ open, onOpenChange, church, onSave }: EditChurchDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")

  const [formData, setFormData] = useState({
    name: church?.name || "",
    denomination: church?.denomination || "",
    pastor: church?.pastor || "",
    email: church?.email || "",
    phone: church?.phone || "",
    website: church?.website || "",
    address: church?.address || "",
    status: church?.status || "active",
    plan: church?.plan || "standard",
    established: church?.established || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (church) {
        onSave({
          ...church,
          ...formData,
        })
      }

      alert("Church updated successfully!")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating church:", error)
      alert("Failed to update church. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!church) return null

  const denominations = [
    "Baptist",
    "Methodist",
    "Presbyterian",
    "Pentecostal",
    "Lutheran",
    "Episcopal",
    "Catholic",
    "Non-denominational",
    "Assembly of God",
    "Church of Christ",
    "Other",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Church
          </DialogTitle>
          <DialogDescription>Update church information and settings</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Basic Church Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                        {formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Church Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Grace Community Church"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Denomination *</label>
                      <Select
                        value={formData.denomination}
                        onValueChange={(value) => handleChange("denomination", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          {denominations.map((denomination) => (
                            <SelectItem key={denomination} value={denomination.toLowerCase()}>
                              {denomination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Lead Pastor *</label>
                      <Input
                        value={formData.pastor}
                        onChange={(e) => handleChange("pastor", e.target.value)}
                        placeholder="Rev. John Smith"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Established Date *</label>
                      <Input
                        type="date"
                        value={formData.established}
                        onChange={(e) => handleChange("established", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Church Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="info@church.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number *</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      placeholder="www.church.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Full Address *</label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Faith Street, Springfield, IL 62701"
                      className="min-h-[80px]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Church Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Branches</label>
                      <Input type="number" value={church.branches} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Total Members</label>
                    <Input type="number" value={church.members} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">This value is automatically calculated</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-2">Important Settings</h4>
                    <p className="text-sm text-amber-700">
                      Changing the church status may affect access to the system for all users associated with this
                      church. Please proceed with caution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Plan</label>
                    <Select value={formData.plan} onValueChange={(value) => handleChange("plan", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $29/month</SelectItem>
                        <SelectItem value="standard">Standard - $79/month</SelectItem>
                        <SelectItem value="premium">Premium - $149/month</SelectItem>
                        <SelectItem value="enterprise">Enterprise - Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Monthly Revenue</label>
                      <Input type="number" value={church.revenue} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Growth Rate</label>
                      <Input value={`${church.growth}%`} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Plan Change Notice</h4>
                    <p className="text-sm text-blue-700">
                      Changing the subscription plan will take effect immediately. The church will be charged the
                      prorated amount for the remainder of the billing cycle.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ["basic", "contact", "settings", "subscription"]
                const currentIndex = tabs.indexOf(currentTab)
                if (currentIndex > 0) {
                  setCurrentTab(tabs[currentIndex - 1])
                }
              }}
              disabled={currentTab === "basic"}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {currentTab !== "subscription" ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ["basic", "contact", "settings", "subscription"]
                    const currentIndex = tabs.indexOf(currentTab)
                    if (currentIndex < tabs.length - 1) {
                      setCurrentTab(tabs[currentIndex + 1])
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
