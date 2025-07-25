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
import { useRegisterGroup } from '@/lib/hooks/group/use-group-queries';
import { GROUP_CATEGORY_OPTIONS, MEETING_DAY_OPTIONS } from '@/lib/utils';
import {
  type AddGroupPayload,
  addGroupSchema,
} from '@/lib/validations/small-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { NumberInput } from '../number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AddSmallGroupFormProps {
  onCloseDialog: () => void;
}

export function AddSmallGroupForm({ onCloseDialog }: AddSmallGroupFormProps) {
  const {
    mutateAsync: registerGroupMutation,
    isPending,
    isError,
    error,
  } = useRegisterGroup();
  const groupForm = useForm<AddGroupPayload>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      groupName: '',
      leaderId: '',
      meetingDay: [],
      meetingTime: [],
      description: '',
      category: '',
      capacity: '',
      location: '',
    },
  });
  const { reset } = groupForm;
  const onSubmitGroupForm = async (payload: AddGroupPayload) => {
    await registerGroupMutation(payload);
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
      <Form {...groupForm}>
        <form
          className="space-y-4"
          onSubmit={groupForm.handleSubmit(onSubmitGroupForm)}
        >
          <FormField
            control={groupForm.control}
            name="groupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={groupForm.control}
            name="leaderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group Leader
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter leader name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={groupForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select group category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[400px] overflow-y-auto">
                    {GROUP_CATEGORY_OPTIONS.map((option) => (
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
            control={groupForm.control}
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
            control={groupForm.control}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={groupForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Meeting Location <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={groupForm.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Capacity (1-20 Members){' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <NumberInput placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={groupForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the group's purpose"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleCancelDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!groupForm.formState.isValid || isPending}
              type="submit"
            >
              {isPending ? 'Adding group...' : 'Add Group'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
