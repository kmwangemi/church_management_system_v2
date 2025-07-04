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
import { FileText, Loader2, Upload } from "lucide-react"

const contentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.string().min(1, "Please select content type"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().min(1, "Please add at least one tag"),
  status: z.string().min(1, "Please select status"),
  file: z.string().optional(),
})

type ContentForm = z.infer<typeof contentSchema>

interface AddContentFormProps {
  onSuccess: () => void
}

export function AddContentForm({ onSuccess }: AddContentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      category: "",
      tags: "",
      status: "draft",
      file: "",
    },
  })

  const onSubmit = async (data: ContentForm) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Content data:", data)
      onSuccess()
    } catch (error) {
      console.error("Error adding content:", error)
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
              <FileText className="h-5 w-5" />
              <span>Content Details</span>
            </CardTitle>
            <CardDescription>Add new content to the church library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter content title" {...field} />
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
                    <Textarea placeholder="Describe the content..." rows={3} {...field} />
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
                    <FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sermon">Sermon</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="gallery">Photo Gallery</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="worship">Worship</SelectItem>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="study-material">Study Material</SelectItem>
                        <SelectItem value="resource">Resource</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags separated by commas (e.g., faith, prayer, worship)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload File (Optional)</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.mp3,.mp4,.jpg,.jpeg,.png,.ppt,.pptx"
                          className="hidden"
                          id="file-upload"
                          {...field}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Click to upload a file
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, MP3, MP4, JPG, PNG, PPT up to 100MB</p>
                      </div>
                    </div>
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
                Adding Content...
              </>
            ) : (
              "Add Content"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
