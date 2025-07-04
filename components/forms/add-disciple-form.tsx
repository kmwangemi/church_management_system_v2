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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Loader2 } from "lucide-react"

const discipleSchema = z.object({
  member: z.string().min(1, "Please select a member"),
  mentor: z.string().min(1, "Please select a mentor"),
  startDate: z.string().min(1, "Start date is required"),
  currentLevel: z.string().min(1, "Please select current level"),
  goals: z.string().min(10, "Please describe discipleship goals"),
  notes: z.string().optional(),
})

type DiscipleForm = z.infer<typeof discipleSchema>

interface AddDiscipleFormProps {
  onSuccess: () => void
}

export function AddDiscipleForm({ onSuccess }: AddDiscipleFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<DiscipleForm>({
    resolver: zodResolver(discipleSchema),
    defaultValues: {
      member: "",
      mentor: "",
      startDate: new Date().toISOString().split("T")[0],
      currentLevel: "",
      goals: "",
      notes: "",
    },
  })

  const onSubmit = async (data: DiscipleForm) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Disciple data:", data)
      onSuccess()
    } catch (error) {
      console.error("Error adding disciple:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Discipleship Information</span>
            </CardTitle>
            <CardDescription>Add a new person to the discipleship program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="john-smith">John Smith</SelectItem>
                        <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="emily-davis">Emily Davis</SelectItem>
                        <SelectItem value="david-wilson">David Wilson</SelectItem>
                        <SelectItem value="michael-brown">Michael Brown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mentor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mentor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pastor-michael">Pastor Michael Brown</SelectItem>
                        <SelectItem value="david-wilson">David Wilson</SelectItem>
                        <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="emily-davis">Emily Davis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new-convert">New Convert</SelectItem>
                        <SelectItem value="growing">Growing</SelectItem>
                        <SelectItem value="mature">Mature</SelectItem>
                        <SelectItem value="leader">Leader</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discipleship Goals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the discipleship goals and objectives..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes or observations..." rows={3} {...field} />
                  </FormControl>
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
                Adding Disciple...
              </>
            ) : (
              "Add Disciple"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
