"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Loader2 } from "lucide-react"

const eventSchema = z.object({
  title: z.string().min(2, "Event title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Please select event type"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(2, "Location is required"),
  expectedAttendees: z.string().min(1, "Expected attendees is required"),
  organizer: z.string().min(2, "Organizer name is required"),
  requiresRegistration: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  registrationDeadline: z.string().optional(),
  maxAttendees: z.string().optional(),
  notes: z.string().optional(),
})

type EventForm = z.infer<typeof eventSchema>

interface AddEventFormProps {
  onSuccess: () => void
}

export function AddEventForm({ onSuccess }: AddEventFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      expectedAttendees: "",
      organizer: "",
      requiresRegistration: false,
      isRecurring: false,
      recurringPattern: "",
      registrationDeadline: "",
      maxAttendees: "",
      notes: "",
    },
  })

  const onSubmit = async (data: EventForm) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Event data:", data)
      onSuccess()
    } catch (error) {
      console.error("Error creating event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Details</span>
            </CardTitle>
            <CardDescription>Basic event information and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the event" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="study">Bible Study</SelectItem>
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="social">Social Event</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      <Input placeholder="Event organizer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date, Time & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Schedule & Location</span>
            </CardTitle>
            <CardDescription>When and where the event will take place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recurring Event</FormLabel>
                      <p className="text-sm text-gray-500">This event repeats on a schedule</p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("isRecurring") && (
                <FormField
                  control={form.control}
                  name="recurringPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring Pattern</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Attendance & Registration</span>
            </CardTitle>
            <CardDescription>Expected attendance and registration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Attendees</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number of expected attendees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Attendees (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Maximum capacity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiresRegistration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Registration</FormLabel>
                    <p className="text-sm text-gray-500">Attendees must register to attend</p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("requiresRegistration") && (
              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional information about the event" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
