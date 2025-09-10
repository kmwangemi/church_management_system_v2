'use client';

import RenderApiError from '@/components/api-error';
import { MultiSelect } from '@/components/multi-select';
import { TimeInput } from '@/components/time-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterDepartment } from '@/lib/hooks/department/use-department-queries';
import type { UserResponse } from '@/lib/types/user';
import { MEETING_DAY_OPTIONS } from '@/lib/utils';
import {
  type AddDepartmentPayload,
  addDepartmentSchema,
} from '@/lib/validations/department';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserListInput } from '../user-list-input';

interface AddDepartmentFormProps {
  onCloseDialog: () => void;
}

export function AddDepartmentForm({ onCloseDialog }: AddDepartmentFormProps) {
  const { id } = useParams();
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  const {
    mutateAsync: registerDepartmentMutation,
    isPending,
    isError,
    error,
  } = useRegisterDepartment();
  const departmentForm = useForm<AddDepartmentPayload>({
    resolver: zodResolver(addDepartmentSchema),
    defaultValues: {
      departmentName: '',
      leaderId: undefined,
      meetingDay: [],
      meetingTime: [],
      description: '',
    },
  });
  const { reset } = departmentForm;
  const onSubmitDepartmentForm = async (payload: AddDepartmentPayload) => {
    if (id) {
      payload.branchId = Array.isArray(id) ? id[0] : String(id); // Assign branchId as string from route params
    }
    await registerDepartmentMutation(payload);
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
      <Form {...departmentForm}>
        <form
          className="space-y-4"
          onSubmit={departmentForm.handleSubmit(onSubmitDepartmentForm)}
        >
          <FormField
            control={departmentForm.control}
            name="departmentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Department Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Choir" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={departmentForm.control}
            name="leaderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leader (Optional)</FormLabel>
                <FormControl>
                  <UserListInput
                    className="w-full"
                    onChange={(member) => {
                      setSelectedMember(member);
                      field.onChange(member?._id || ''); // ✅ Store only the ID
                    }}
                    placeholder="Search and select a leader"
                    value={selectedMember} // ✅ Use state for display
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={departmentForm.control}
            name="meetingDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Meeting day(s) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    onChange={field.onChange}
                    options={MEETING_DAY_OPTIONS}
                    placeholder="Select meeting day(s)"
                    selected={field.value || []}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={departmentForm.control}
            name="meetingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Meeting Time(s) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <TimeInput
                    multiSelect
                    onChange={field.onChange}
                    placeholder="Select meeting times"
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={departmentForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right" htmlFor="description">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="col-span-3"
                    id="description"
                    placeholder="Enter department description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage className="col-span-3 col-start-2" />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleCancelDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!departmentForm.formState.isValid || isPending}
              type="submit"
            >
              {isPending ? 'Adding department...' : 'Add Department'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
