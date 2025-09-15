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
import { UserListInput } from '@/components/user-list-input';
import { useAddDepartmentMember } from '@/lib/hooks/church/department/use-department-queries';
import type { UserResponse } from '@/lib/types/user';
import { DEPARTMENT_MEMBER_ROLE_OPTIONS, getRelativeYear } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export const addDepartmentMemberSchema = z.object({
  userId: z.string().min(1, 'Please select department member'),
  role: z.string().min(1, 'Please select a role'),
  skills: z.string().min(1, 'Please enter at least one skill').trim(),
  joinedDate: z.string().min(1, 'Joined date is required'),
});

export type AddDepartmentMemberPayload = z.infer<
  typeof addDepartmentMemberSchema
>;

interface AddDepartmentMemberFormProps {
  departmentId: string;
  onCloseDialog: () => void;
}

export function AddDepartmentMemberForm({
  departmentId,
  onCloseDialog,
}: AddDepartmentMemberFormProps) {
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  const {
    mutateAsync: addDepartmentMemberMutation,
    isPending,
    isError,
    error,
  } = useAddDepartmentMember();
  const form = useForm<AddDepartmentMemberPayload>({
    resolver: zodResolver(addDepartmentMemberSchema),
    defaultValues: {
      userId: undefined,
      role: '',
      skills: '',
      joinedDate: '',
    },
  });
  const { reset } = form;
  // Handle form submission
  const onSubmit = async (payload: AddDepartmentMemberPayload) => {
    await addDepartmentMemberMutation({ departmentId, payload });
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
                <Users className="h-5 w-5" />
                <span>Member Information</span>
              </CardTitle>
              <CardDescription>Add a new department member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select Member <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <UserListInput
                        className="w-full"
                        onChange={(member) => {
                          setSelectedMember(member);
                          field.onChange(member?._id || ''); // ✅ Store only the ID
                        }}
                        placeholder="Search and select a member"
                        value={selectedMember} // ✅ Use state for display
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
                    <FormLabel>
                      Role in Department <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px] overflow-y-auto">
                        {DEPARTMENT_MEMBER_ROLE_OPTIONS.map((option) => (
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
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Skills <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter skills separated by commas (e.g., guitar, vocals, piano)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="joinedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Joined Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        format="long"
                        maxDate={new Date()}
                        minDate={getRelativeYear(-30)}
                        onChange={(date) =>
                          field.onChange(date ? date.toISOString() : '')
                        }
                        placeholder="Select established date"
                        value={field.value ? new Date(field.value) : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Member...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
