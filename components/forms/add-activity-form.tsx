'use client';

import RenderApiError from '@/components/api-error';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UserResponse } from '@/lib/types/user';
import {
  ACTIVITY_STATUS_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  getRelativeYear,
} from '@/lib/utils';
import {
  addActivitySchema,
  type AddActivityPayload,
} from '@/lib/validations/activity';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DatePicker } from '../date-picker';
import { NumberInput } from '../number-input';
import { UserListInput } from '../user-list-input';

interface AddActivityFormProps {
  onCloseDialog: () => void;
}

export function AddActivityForm({ onCloseDialog }: AddActivityFormProps) {
  const { id } = useParams();
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );

  // Mock hook - replace with actual implementation
  const {
    mutateAsync: registerActivityMutation,
    isPending,
    isError,
    error,
  } = {
    mutateAsync: async (payload: AddActivityPayload) => {
      console.log('Activity payload:', payload);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    isPending: false,
    isError: false,
    error: null,
  };

  const activityForm = useForm<AddActivityPayload>({
    resolver: zodResolver(addActivitySchema),
    defaultValues: {
      activity: '',
      participants: '',
      type: 'event',
      status: 'planned',
      startTime: '',
      endTime: '',
      location: '',
      facilitator: '',
      budget: '',
      description: '',
    },
  });

  const { reset } = activityForm;

  const onSubmitActivityForm = async (payload: AddActivityPayload) => {
    if (id) {
      payload.branchId = Array.isArray(id) ? id[0] : String(id);
    }
    await registerActivityMutation(payload);
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
      <Form {...activityForm}>
        <form
          className="space-y-4"
          onSubmit={activityForm.handleSubmit(onSubmitActivityForm)}
        >
          <FormField
            control={activityForm.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Activity Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Christmas Service Planning" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={activityForm.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Activity Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      format="long"
                      maxDate={getRelativeYear(2)}
                      minDate={new Date()}
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString() : '')
                      }
                      placeholder="Select start date"
                      value={field.value ? new Date(field.value) : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={activityForm.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Participants <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={activityForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Activity Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTIVITY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
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
              control={activityForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTIVITY_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={activityForm.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <TimeInput
                      onChange={field.onChange}
                      placeholder="Select start time"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={activityForm.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <TimeInput
                      onChange={field.onChange}
                      placeholder="Select end time"
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={activityForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Sanctuary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={activityForm.control}
              name="facilitator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Facilitator <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <UserListInput
                      className="w-full"
                      onChange={(member) => {
                        setSelectedMember(member);
                        field.onChange(member?._id || ''); // ✅ Store only the ID
                      }}
                      placeholder="Search and select a facilitator"
                      value={selectedMember} // ✅ Use state for display
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={activityForm.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (KES)</FormLabel>
                <FormControl>
                  <NumberInput placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={activityForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter activity description..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
              disabled={!activityForm.formState.isValid || isPending}
              type="submit"
            >
              {isPending ? 'Adding activity...' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
