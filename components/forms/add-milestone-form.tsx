'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Award, Loader2 } from 'lucide-react';
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

const milestoneSchema = z.object({
  name: z.string().min(2, 'Milestone name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  points: z.string().min(1, 'Please enter point value'),
  requirements: z.string().optional(),
});

type MilestoneForm = z.infer<typeof milestoneSchema>;

interface AddMilestoneFormProps {
  onSuccess: () => void;
}

export function AddMilestoneForm({ onSuccess }: AddMilestoneFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MilestoneForm>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      points: '',
      requirements: '',
    },
  });

  const onSubmit = async (data: MilestoneForm) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.log('Milestone data:', data);
      onSuccess();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.error('Error adding milestone:', error);
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
              <Award className="h-5 w-5" />
              <span>Milestone Details</span>
            </CardTitle>
            <CardDescription>
              Create a new discipleship milestone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter milestone name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the milestone..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="sacrament">Sacrament</SelectItem>
                        <SelectItem value="ministry">Ministry</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Point Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter points"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any requirements to achieve this milestone..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
                Creating Milestone...
              </>
            ) : (
              'Create Milestone'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
