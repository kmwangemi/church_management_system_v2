import { DatePicker } from '@/components/date-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
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
import { Switch } from '@/components/ui/switch';
import { UserListInput } from '@/components/user-list-input';
import type { VisitorDetailsCardProps } from '@/lib/types/index';
import type { UserResponse } from '@/lib/types/user';
import {
  FOLLOW_UP_STATUS_OPTIONS,
  getRelativeYear,
  REFERRAL_SOURCE_OPTIONS,
} from '@/lib/utils';
import { useState } from 'react';

export const VisitorDetailsCard: React.FC<VisitorDetailsCardProps> = ({
  form,
}) => {
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor Details</CardTitle>
        <CardDescription>Visitor-specific information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="visitorDetails.visitorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visitor ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visitorDetails.visitDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Date</FormLabel>
              <FormControl>
                <DatePicker
                  format="long"
                  maxDate={getRelativeYear(1)}
                  minDate={getRelativeYear(-50)}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : '')
                  }
                  placeholder="Visit date"
                  value={field.value ? new Date(field.value) : undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visitorDetails.howDidYouHear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How Did You Hear About Us?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select how you heard about us" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  {REFERRAL_SOURCE_OPTIONS.map((option) => (
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
          name="visitorDetails.followUpStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Follow Up Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select follow up status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  {FOLLOW_UP_STATUS_OPTIONS.map((option) => (
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
          name="visitorDetails.interestedInMembership"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Interested in Membership
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visitorDetails.invitedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invited By</FormLabel>
              <FormControl>
                <UserListInput
                  className="w-full"
                  onChange={(member) => {
                    setSelectedMember(member);
                    field.onChange(member?._id || '');
                  }}
                  placeholder="Search and select a member"
                  value={selectedMember}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
