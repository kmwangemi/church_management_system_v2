'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Loader2, Search, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const checkInSchema = z.object({
  service: z.string().min(1, 'Please select a service'),
  members: z.array(z.string()).min(1, 'Please select at least one member'),
  notes: z.string().optional(),
});

type CheckInForm = z.infer<typeof checkInSchema>;

interface AttendanceCheckInFormProps {
  onSuccess: () => void;
}

const mockMembers = [
  {
    id: '1',
    name: 'John Smith',
    department: 'Choir',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    department: 'Ushering',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '3',
    name: 'Emily Davis',
    department: 'Youth',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '4',
    name: 'David Wilson',
    department: 'Administration',
    avatar: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '5',
    name: 'Michael Brown',
    department: 'Leadership',
    avatar: '/placeholder.svg?height=40&width=40',
  },
];

export function AttendanceCheckInForm({
  onSuccess,
}: AttendanceCheckInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      service: '',
      members: [],
      notes: '',
    },
  });

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: CheckInForm) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // biome-ignore lint/suspicious/noConsole: ignore
      console.log('Check-in data:', data);
      onSuccess();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: ignore
      console.error('Error checking in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sunday-morning">
                      Sunday Morning Service
                    </SelectItem>
                    <SelectItem value="sunday-evening">
                      Sunday Evening Service
                    </SelectItem>
                    <SelectItem value="wednesday-study">
                      Wednesday Bible Study
                    </SelectItem>
                    <SelectItem value="friday-youth">
                      Friday Youth Service
                    </SelectItem>
                    <SelectItem value="special-event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end">
            <div className="text-gray-600 text-sm">
              <Clock className="mr-1 inline h-4 w-4" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Members</span>
              <Badge variant="secondary">
                {form.watch('members')?.length || 0} selected
              </Badge>
            </CardTitle>
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members..."
                value={searchTerm}
              />
            </div>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="members"
              render={() => (
                <FormItem>
                  <div className="max-h-60 space-y-3 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <FormField
                        control={form.control}
                        key={member.id}
                        name="members"
                        render={({ field }) => {
                          return (
                            <FormItem
                              className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-gray-50"
                              key={member.id}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          member.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== member.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  alt={member.name}
                                  src={member.avatar || '/placeholder.svg'}
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <FormLabel className="cursor-pointer font-medium text-sm">
                                  {member.name}
                                </FormLabel>
                                <p className="text-gray-500 text-xs">
                                  {member.department}
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

        <div className="flex justify-end space-x-4">
          <Button onClick={onSuccess} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
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
  );
}
