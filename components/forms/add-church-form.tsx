"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Church, Upload, User, MapPin, Building2 } from "lucide-react"

const churchSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Church name must be at least 2 characters"),
  denomination: z.string().min(1, "Please select a denomination"),
  description: z.string().optional(),
  established: z.string().min(1, "Please enter establishment date"),

  // Contact Information
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),

  // Address
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "Please enter city"),
  state: z.string().min(2, "Please enter state"),
  zipCode: z.string().min(5, "Please enter zip code"),
  country: z.string().min(2, "Please enter country"),

  // Pastor Information
  pastorName: z.string().min(2, "Pastor name must be at least 2 characters"),
  pastorEmail: z.string().email("Please enter a valid email address"),
  pastorPhone: z.string().min(10, "Please enter a valid phone number"),

  // Subscription
  subscriptionPlan: z.string().min(1, "Please select a subscription plan"),

  // Initial Setup
  expectedMembers: z.string().min(1, "Please enter expected number of members"),
  numberOfBranches: z.string().min(1, "Please enter number of branches"),
})

type ChurchFormData = z.infer<typeof churchSchema>

interface AddChurchFormProps {
  onSuccess: () => void
}

export function AddChurchForm({ onSuccess }: AddChurchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: "",
      denomination: "",
      description: "",
      established: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      pastorName: "",
      pastorEmail: "",
      pastorPhone: "",
      subscriptionPlan: "",
      expectedMembers: "",
      numberOfBranches: "1",
    },
  })

  const onSubmit = async (data: ChurchFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Church registration data:", data)

      // Show success message
      alert("Church registered successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error registering church:", error)
      alert("Failed to register church. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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

  const subscriptionPlans = [
    { value: "basic", label: "Basic - $29/month", description: "Up to 100 members, basic features" },
    { value: "standard", label: "Standard - $79/month", description: "Up to 500 members, advanced features" },
    { value: "premium", label: "Premium - $149/month", description: "Unlimited members, all features" },
    { value: "enterprise", label: "Enterprise - Custom", description: "Custom solution for large churches" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="pastor">Pastor</TabsTrigger>
            <TabsTrigger value="subscription">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Church className="h-5 w-5" />
                  <span>Basic Church Information</span>
                </CardTitle>
                <CardDescription>Enter the basic details about the church</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Grace Community Church" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denomination *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select denomination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {denominations.map((denomination) => (
                              <SelectItem key={denomination} value={denomination.toLowerCase()}>
                                {denomination}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the church's mission and vision..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional description that will appear on the church profile</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="established"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Established Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Church Logo" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Church className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                    </div>
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
                <CardDescription>Church contact details and address information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@church.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.church.com" {...field} />
                      </FormControl>
                      <FormDescription>Optional church website URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Church Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pastor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Pastor Information</span>
                </CardTitle>
                <CardDescription>Details about the lead pastor or church administrator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pastorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pastor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Rev. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pastorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pastor Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="pastor@church.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pastorPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pastor Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Administrator Account</h4>
                  <p className="text-sm text-blue-700">
                    The pastor will be set up as the primary administrator with full access to the church management
                    system. They can add additional users and assign roles as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Subscription Plan & Setup</span>
                </CardTitle>
                <CardDescription>
                  Choose the right plan for your church and provide initial setup information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="subscriptionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Plan *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {subscriptionPlans.map((plan) => (
                            <div
                              key={plan.value}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === plan.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => field.onChange(plan.value)}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <input
                                  type="radio"
                                  checked={field.value === plan.value}
                                  onChange={() => field.onChange(plan.value)}
                                  className="text-blue-600"
                                />
                                <span className="font-medium">{plan.label}</span>
                              </div>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Number of Members *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-50">1-50 members</SelectItem>
                            <SelectItem value="51-100">51-100 members</SelectItem>
                            <SelectItem value="101-250">101-250 members</SelectItem>
                            <SelectItem value="251-500">251-500 members</SelectItem>
                            <SelectItem value="501-1000">501-1000 members</SelectItem>
                            <SelectItem value="1000+">1000+ members</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfBranches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Branches *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 branch (Main church only)</SelectItem>
                            <SelectItem value="2">2 branches</SelectItem>
                            <SelectItem value="3">3 branches</SelectItem>
                            <SelectItem value="4">4 branches</SelectItem>
                            <SelectItem value="5">5 branches</SelectItem>
                            <SelectItem value="5+">More than 5 branches</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Church account will be created and activated</li>
                    <li>• Pastor will receive login credentials via email</li>
                    <li>• 30-day free trial will begin automatically</li>
                    <li>• Our support team will help with initial setup</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tabs = ["basic", "contact", "pastor", "subscription"]
              const currentIndex = tabs.indexOf(currentTab)
              if (currentIndex > 0) {
                setCurrentTab(tabs[currentIndex - 1])
              }
            }}
            disabled={currentTab === "basic"}
          >
            Previous
          </Button>

          {currentTab !== "subscription" ? (
            <Button
              type="button"
              onClick={() => {
                const tabs = ["basic", "contact", "pastor", "subscription"]
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
              {isLoading ? "Registering..." : "Register Church"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
