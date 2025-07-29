'use client';

import RenderApiError from '@/components/api-error';
import { DatePicker } from '@/components/date-picker';
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
import { useRegisterAnnouncement } from '@/lib/hooks/announcement/use-announcement-queries';
import {
  ANNOUNCEMENT_CATEGORY_OPTIONS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  ANNOUNCEMENT_STATUS_OPTIONS,
  getRelativeYear,
} from '@/lib/utils';
import {
  type AddAnnouncementPayload,
  AddAnnouncementSchema,
} from '@/lib/validations/announcement';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CreateAnnouncementFormProps {
  onCloseDialog: () => void;
}

export function CreateAnnouncementForm({
  onCloseDialog,
}: CreateAnnouncementFormProps) {
  const {
    mutateAsync: registerAssetMutation,
    isPending,
    isError,
    error,
  } = useRegisterAnnouncement();
  const form = useForm<AddAnnouncementPayload>({
    resolver: zodResolver(AddAnnouncementSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      priority: '',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'draft',
    },
  });
  const { reset } = form;
  // Handle form submission
  const onSubmit = async (payload: AddAnnouncementPayload) => {
    await registerAssetMutation(payload);
    onCloseDialog();
    reset();
  };
  const handleCancelDialog = () => {
    onCloseDialog();
    reset();
  };
  return (
    <>
      {isError && <RenderApiError error={error} />}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Announcement Details</span>
              </CardTitle>
              <CardDescription>
                Create a new announcement for the member board
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Announcement Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter announcement title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Content <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter announcement content..."
                        rows={5}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {ANNOUNCEMENT_CATEGORY_OPTIONS.map((option) => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Priority <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {ANNOUNCEMENT_PRIORITY_OPTIONS.map((option) => (
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Publish Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          format="long"
                          maxDate={getRelativeYear(1)}
                          minDate={new Date()}
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder="Select publish date"
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <DatePicker
                          format="long"
                          maxDate={getRelativeYear(1)}
                          minDate={new Date()}
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder="Select expiry date"
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px] overflow-y-auto">
                          {ANNOUNCEMENT_STATUS_OPTIONS.map((option) => (
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
            </CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleCancelDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!form.formState.isValid || isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Announcement'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
