"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserCheck, Clock, Loader2 } from "lucide-react"

const checkInSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  members: z.array(z.string()).min(1, "Please select at least one member"),
  notes: z.string().optional(),
})

type CheckInForm = z.infer<typeof checkInSchema>

interface AttendanceCheckInFormProps {
  onSuccess: () => void
}

const mockMembers = [
  { id: "1", name: "John Smith", department: "Choir", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Sarah Johnson", department: "Ushering", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Emily Davis", department: "Youth", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "4", name: "David Wilson", department: "Administration", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "Michael Brown", department: "Leadership", avatar: "/placeholder.svg?height=40&width=40" },
]

export function AttendanceCheckInForm({ onSuccess }: AttendanceCheckInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const form = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      service: "",
      members: [],
      notes: "",
    },
  })

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const onSubmit = async (data: CheckInForm) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Check-in data:", data)
      onSuccess()
    } catch (error) {
      console.error("Error checking in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sunday-morning">Sunday Morning Service</SelectItem>
                    <SelectItem value="sunday-evening">Sunday Evening Service</SelectItem>
                    <SelectItem value="wednesday-study">Wednesday Bible Study</SelectItem>
                    <SelectItem value="friday-youth">Friday Youth Service</SelectItem>
                    <SelectItem value="special-event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <Clock className="inline h-4 w-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Members</span>
              <Badge variant="secondary">{form.watch("members")?.length || 0} selected</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="members"
              render={() => (
                <FormItem>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <FormField
                        key={member.id}
                        control={form.control}
                        name="members"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={member.id}
                              className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, member.id])
                                      : field.onChange(field.value?.filter((value) => value !== member.id))
                                  }}
                                />
                              </FormControl>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <FormLabel className="text-sm font-medium cursor-pointer">{member.name}</FormLabel>
                                <p className="text-xs text-gray-500">{member.department}</p>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Check In Members
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
