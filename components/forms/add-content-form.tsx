'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  CONTENT_CATEGORY_OPTIONS,
  CONTENT_STATUS_OPTIONS,
  CONTENT_TYPE_OPTIONS,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const AddcontentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.string().min(1, 'Please select content type'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().min(1, 'Please add at least one tag'),
  status: z.string().min(1, 'Please select status'),
  file: z.string().optional(),
});

type AddContentPayload = z.infer<typeof AddcontentSchema>;

interface AddContentFormProps {
  onCloseDialog: () => void;
}

export function AddContentForm({ onCloseDialog }: AddContentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<AddContentPayload>({
    resolver: zodResolver(AddcontentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      category: '',
      tags: '',
      status: 'draft',
      file: '',
    },
  });
  const onSubmit = async (data: AddContentPayload) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.log('Content data:', data);
      onCloseDialog();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.error('Error adding content:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Content Details</span>
            </CardTitle>
            <CardDescription>
              Add new content to the church library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Content Title <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the content..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Content Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {CONTENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>
                      Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {CONTENT_CATEGORY_OPTIONS.map((option) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas (e.g., faith, prayer, worship)"
                      {...field}
                    />
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
                  <FormLabel>
                    Status <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[400px] overflow-y-auto">
                      {CONTENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem
                          className="cursor-pointer"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
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
                    <div className="rounded-lg border-2 border-gray-300 border-dashed p-6 text-center transition-colors hover:border-gray-400">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Input
                          accept=".pdf,.doc,.docx,.mp3,.mp4,.jpg,.jpeg,.png,.ppt,.pptx"
                          className="hidden"
                          id="file-upload"
                          type="file"
                          {...field}
                        />
                        <label
                          className="cursor-pointer font-medium text-blue-600 text-sm hover:text-blue-500"
                          htmlFor="file-upload"
                        >
                          Click to upload a file
                        </label>
                        <p className="mt-1 text-gray-500 text-xs">
                          PDF, DOC, MP3, MP4, JPG, PNG, PPT up to 100MB
                        </p>
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
          <Button onClick={onCloseDialog} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Content...
              </>
            ) : (
              'Add Content'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
