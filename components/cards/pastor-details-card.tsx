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
import { Textarea } from '@/components/ui/textarea';
import type { PastorDetailsCardProps } from '@/lib/types/index';
import { getRelativeYear } from '@/lib/utils';

export const PastorDetailsCard: React.FC<PastorDetailsCardProps> = ({
  form,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pastor Details</CardTitle>
        <CardDescription>Pastor-specific information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="pastorDetails.pastorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pastor ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pastorDetails.ordinationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordination Date</FormLabel>
              <FormControl>
                <DatePicker
                  format="long"
                  maxDate={getRelativeYear(1)}
                  minDate={getRelativeYear(-50)}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : '')
                  }
                  placeholder="Ordination date"
                  value={field.value ? new Date(field.value) : undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pastorDetails.sermonCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sermon Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pastorDetails.counselingSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Counseling Sessions</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="pastorDetails.biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
