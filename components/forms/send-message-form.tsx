'use client';

import RenderApiError from '@/components/api-error';
import { DatePicker } from '@/components/date-picker';
import { TimeInput } from '@/components/time-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { getRelativeYear, MESSAGE_SEND_TIME_OPTIONS } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const messageSchema = z.object({
  type: z.string().min(1, 'Please select message type'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  content: z.string().min(10, 'Message content must be at least 10 characters'),
  recipients: z
    .array(z.string())
    .min(1, 'Please select at least one recipient group'),
  scheduleType: z.string().min(1, 'Please select when to send'),
  scheduleDate: z.string().optional(),
  scheduleTime: z.string().optional(),
  template: z.string().optional(),
});

type MessageForm = z.infer<typeof messageSchema>;

interface SendMessageFormProps {
  onCloseDialog: () => void;
}

const messageRecipientGroups = [
  { id: 'all', name: 'All Members', count: 1234 },
  { id: 'active', name: 'Active Members', count: 1156 },
  { id: 'choir', name: 'Choir Department', count: 45 },
  { id: 'youth', name: 'Youth Department', count: 120 },
  { id: 'ushering', name: 'Ushering Department', count: 32 },
  { id: 'leadership', name: 'Leadership Team', count: 15 },
  { id: 'volunteers', name: 'Volunteers', count: 89 },
];

export function SendMessageForm({ onCloseDialog }: SendMessageFormProps) {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const {
    mutateAsync: registerAssetMutation,
    isPending,
    isError,
    error,
  } = useRegisterAnnouncement();
  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: '',
      title: '',
      content: '',
      recipients: [],
      scheduleType: 'now',
      scheduleDate: '',
      scheduleTime: '',
      template: '',
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
  const getTotalRecipients = () => {
    return selectedRecipients.reduce((total, groupId) => {
      const group = messageRecipientGroups.find((g) => g.id === groupId);
      return total + (group?.count || 0);
    }, 0);
  };
  return (
    <>
      {isError && <RenderApiError error={error} />}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Message Type & Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Message Details</span>
              </CardTitle>
              <CardDescription>Choose message type and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message Type</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sms">
                            <div className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4" />
                              <span>SMS</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="email">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Email</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Use Template (Optional)</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="service-reminder">
                            Service Reminder
                          </SelectItem>
                          <SelectItem value="event-registration">
                            Event Registration
                          </SelectItem>
                          <SelectItem value="welcome-member">
                            Welcome New Member
                          </SelectItem>
                          <SelectItem value="announcement">
                            General Announcement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter message title" {...field} />
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
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your message content..."
                        rows={form.watch('type') === 'sms' ? 4 : 6}
                        {...field}
                      />
                    </FormControl>
                    {form.watch('type') === 'sms' && (
                      <p className="text-gray-500 text-xs">
                        Character count: {field.value?.length || 0}/160 (SMS
                        limit)
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recipients</span>
                </div>
                <Badge variant="secondary">
                  {getTotalRecipients()} members selected
                </Badge>
              </CardTitle>
              <CardDescription>
                Select member groups to send the message to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="recipients"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {messageRecipientGroups.map((group) => (
                        <FormField
                          control={form.control}
                          key={group.id}
                          name="recipients"
                          render={({ field }) => {
                            return (
                              <FormItem
                                className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-gray-50"
                                key={group.id}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(group.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, group.id]
                                        : field.value?.filter(
                                            (value) => value !== group.id
                                          );
                                      field.onChange(newValue);
                                      setSelectedRecipients(newValue);
                                    }}
                                  />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="cursor-pointer font-medium text-sm">
                                    {group.name}
                                  </FormLabel>
                                  <p className="text-gray-500 text-xs">
                                    {group.count} members
                                  </p>
                                </div>
                              </FormItem>
                            );
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
          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Message</CardTitle>
              <CardDescription>Choose when to send the message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Send Options <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select when to send" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {MESSAGE_SEND_TIME_OPTIONS.map((option) => (
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
              {form.watch('scheduleType') === 'scheduled' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="scheduleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Schedule Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            format="long"
                            maxDate={getRelativeYear(1)}
                            minDate={new Date()}
                            onChange={(date) =>
                              field.onChange(date ? date.toISOString() : '')
                            }
                            placeholder="Select schedule date"
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
                    name="scheduleTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Time</FormLabel>
                        <FormControl>
                          <TimeInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {form.watch('scheduleType') === 'draft'
                    ? 'Save Draft'
                    : 'Send Message'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
