'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Loader2 } from 'lucide-react';
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

const offeringSchema = z.object({
  type: z.string().min(1, 'Please select offering type'),
  amount: z.string().min(1, 'Please enter amount'),
  method: z.string().min(1, 'Please select payment method'),
  member: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type OfferingForm = z.infer<typeof offeringSchema>;

interface AddOfferingFormProps {
  onSuccess: () => void;
}

export function AddOfferingForm({ onSuccess }: AddOfferingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OfferingForm>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      type: '',
      amount: '',
      method: '',
      member: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    },
  });

  const onSubmit = async (data: OfferingForm) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.log('Offering data:', data);
      onSuccess();
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: ignore console
      console.error('Error recording offering:', error);
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
              <DollarSign className="h-5 w-5" />
              <span>Offering Details</span>
            </CardTitle>
            <CardDescription>
              Record tithe, offering, or donation information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offering Type</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tithe">Tithe</SelectItem>
                        <SelectItem value="offering">
                          Regular Offering
                        </SelectItem>
                        <SelectItem value="special-offering">
                          Special Offering
                        </SelectItem>
                        <SelectItem value="building-fund">
                          Building Fund
                        </SelectItem>
                        <SelectItem value="mission">Mission Fund</SelectItem>
                        <SelectItem value="thanksgiving">
                          Thanksgiving
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="m-pesa">M-Pesa</SelectItem>
                        <SelectItem value="bank-transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="member"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Transaction reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes"
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
                Recording...
              </>
            ) : (
              'Record Offering'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
