'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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

const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  permissions: z
    .array(z.string())
    .min(1, 'Please select at least one permission'),
  sendWelcomeEmail: z.boolean().default(true),
  temporaryPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

type UserForm = z.infer<typeof userSchema>;

interface AddUserFormProps {
  onCloseDialog: () => void;
}

const permissions = [
  {
    id: 'members',
    name: 'Member Management',
    description: 'Add, edit, and manage church members',
  },
  {
    id: 'finance',
    name: 'Financial Management',
    description: 'Manage offerings, tithes, and expenses',
  },
  {
    id: 'events',
    name: 'Event Management',
    description: 'Create and manage church events',
  },
  {
    id: 'attendance',
    name: 'Attendance Tracking',
    description: 'Track and manage attendance records',
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Send messages and manage announcements',
  },
  {
    id: 'content',
    name: 'Content Management',
    description: 'Manage sermons, documents, and media',
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate and view reports',
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Manage system configuration',
  },
];

export function AddUserForm({ onCloseDialog }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      permissions: [],
      sendWelcomeEmail: true,
      temporaryPassword: '',
    },
  });

  const onSubmit = async (data: UserForm) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // biome-ignore lint/suspicious/noConsole: ignore
      console.log('User data:', data);
      onCloseDialog();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: ignore
      console.error('Error adding user:', error);
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
              <Users className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>
              Create a new user account with specific permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="finance-manager">
                        Finance Manager
                      </SelectItem>
                      <SelectItem value="content-manager">
                        Content Manager
                      </SelectItem>
                      <SelectItem value="event-coordinator">
                        Event Coordinator
                      </SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temporaryPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter temporary password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-gray-500 text-sm">
                    User will be prompted to change this on first login
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Select the permissions this user should have
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {permissions.map((permission) => (
                      <FormField
                        control={form.control}
                        key={permission.id}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 hover:bg-gray-50"
                              key={permission.id}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, permission.id]
                                      : field.value?.filter(
                                          (value) => value !== permission.id
                                        );
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer font-medium text-sm">
                                  {permission.name}
                                </FormLabel>
                                <p className="text-gray-500 text-xs">
                                  {permission.description}
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
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="sendWelcomeEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Send Welcome Email</FormLabel>
                    <p className="text-gray-500 text-sm">
                      Send login credentials and welcome information to the user
                    </p>
                  </div>
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
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
