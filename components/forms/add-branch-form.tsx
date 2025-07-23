'use client';

import RenderApiError from '@/components/api-error';
import { CountrySelect } from '@/components/country-list-input';
import { DatePicker } from '@/components/date-picker';
import { NumberInput } from '@/components/number-input';
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
import { useRegisterBranch } from '@/lib/hooks/branch/use-branch-queries';
import {
  type AddBranchPayload,
  addBranchSchema,
} from '@/lib/validations/branch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface AddBranchFormProps {
  onCloseDialog: () => void;
}

export function AddBranchForm({ onCloseDialog }: AddBranchFormProps) {
  const {
    mutateAsync: registerBranchMutation,
    isPending,
    isError,
    error,
  } = useRegisterBranch();
  const branchForm = useForm<AddBranchPayload>({
    resolver: zodResolver(addBranchSchema),
    defaultValues: {
      branchName: '',
      country: '',
      capacity: '',
      address: '',
      establishedDate: '',
    },
  });
  const { reset } = branchForm;
  // Handle form submission
  const onSubmitBranchForm = async (payload: AddBranchPayload) => {
    await registerBranchMutation(payload);
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
      <Form {...branchForm}>
        <form
          className="space-y-4"
          onSubmit={branchForm.handleSubmit(onSubmitBranchForm)}
        >
          <FormField
            control={branchForm.control}
            name="branchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Branch Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Kibra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={branchForm.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Country <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <CountrySelect
                    onChange={field.onChange}
                    placeholder="Select country"
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={branchForm.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Capacity (1-100,000 Members){' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <NumberInput placeholder="300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={branchForm.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Physical Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Kawangware 46" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={branchForm.control}
            name="establishedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Established Date <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    format="long"
                    maxDate={new Date()}
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
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleCancelDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!branchForm.formState.isValid || isPending}
              type="submit"
            >
              {isPending ? 'Adding branch...' : 'Add Branch'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
