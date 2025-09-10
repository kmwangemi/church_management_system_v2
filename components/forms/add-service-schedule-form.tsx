'use client';

import RenderApiError from '@/components/api-error';
import { TimeInput } from '@/components/time-input';
import { Button } from '@/components/ui/button';
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
import { useCreateServiceSchedule } from '@/lib/hooks/service-schedule/use-service-schedule-queries';
import type { UserResponse } from '@/lib/types/user';
import {
  getRelativeYear,
  MEETING_DAY_OPTIONS,
  SERVICE_TYPE_OPTIONS,
} from '@/lib/utils';
import {
  type AddServiceSchedulePayload,
  addServiceScheduleSchema,
} from '@/lib/validations/service-schedule';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DatePicker } from '../date-picker';
import { NumberInput } from '../number-input';
import { UserListInput } from '../user-list-input';

interface AddServiceScheduleFormProps {
  onCloseDialog: () => void;
}

export function AddServiceScheduleForm({
  onCloseDialog,
}: AddServiceScheduleFormProps) {
  const { id } = useParams();
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  const {
    mutateAsync: registerServiceScheduleMutation,
    isPending,
    isError,
    error,
  } = useCreateServiceSchedule();
  const serviceScheduleForm = useForm<AddServiceSchedulePayload>({
    resolver: zodResolver(addServiceScheduleSchema),
    defaultValues: {
      day: 'Sunday',
      time: '',
      service: '',
      type: 'worship',
      duration: '',
      attendance: '',
      startDate: '',
      endDate: '',
      recurring: true,
      isActive: true,
      facilitator: undefined,
      location: '',
      notes: '',
    },
  });
  const { reset } = serviceScheduleForm;
  const onSubmitServiceScheduleForm = async (
    payload: AddServiceSchedulePayload
  ) => {
    if (id) {
      payload.branchId = Array.isArray(id) ? id[0] : String(id);
    }
    await registerServiceScheduleMutation(payload);
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
      <Form {...serviceScheduleForm}>
        <form
          className="space-y-4"
          onSubmit={serviceScheduleForm.handleSubmit(
            onSubmitServiceScheduleForm
          )}
        >
          <FormField
            control={serviceScheduleForm.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Service Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Morning Worship" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={serviceScheduleForm.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Day <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEETING_DAY_OPTIONS.map((option) => (
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
              control={serviceScheduleForm.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Time <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <TimeInput
                      onChange={field.onChange}
                      placeholder="Select service time"
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
              control={serviceScheduleForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Service Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_TYPE_OPTIONS.map((option) => (
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
              control={serviceScheduleForm.control}
              name="attendance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Attendance</FormLabel>
                  <FormControl>
                    <NumberInput placeholder="180" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={serviceScheduleForm.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <NumberInput placeholder="90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={serviceScheduleForm.control}
              name="facilitator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilitator/Leader</FormLabel>
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
            control={serviceScheduleForm.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Main Sanctuary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={serviceScheduleForm.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (Optional)</FormLabel>
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
              control={serviceScheduleForm.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      format="long"
                      maxDate={getRelativeYear(2)}
                      minDate={new Date()}
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString() : '')
                      }
                      placeholder="Select end date"
                      value={field.value ? new Date(field.value) : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={serviceScheduleForm.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Service</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={serviceScheduleForm.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Schedule</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={serviceScheduleForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about the service schedule..."
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
              disabled={!serviceScheduleForm.formState.isValid || isPending}
              type="submit"
            >
              {isPending
                ? 'Adding service schedule...'
                : 'Add Service Schedule'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
