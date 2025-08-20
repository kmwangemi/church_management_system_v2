'use client';

import RenderApiError from '@/components/api-error';
import { PasswordInput } from '@/components/password-input';
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
import { useLogin } from '@/lib/hooks/auth/use-login-queries';
import { errorToastStyle } from '@/lib/toast-styles';
import { type LoginPayload, loginSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { mutateAsync: loginMutation, isPending, isError, error } = useLogin();
  const { reset } = form;
  const onSubmit = async (payload: LoginPayload) => {
    const result = await loginMutation(payload);
    if (!result) return; // Handle case where login fails
    // Reset form before navigation
    reset();
    // Determine redirect path
    let redirectPath = '/member'; // default
    if (result.user.role === 'superadmin') {
      redirectPath = '/superadmin';
    } else if (result.user.role === 'admin') {
      redirectPath = '/dashboard';
    }
    // Use window.location for a hard redirect instead of router.push
    // This ensures a fresh page load and clears any cached state
    window.location.href = redirectPath;
  };
  useEffect(() => {
    if (reason === 'expired') {
      toast.error('Your session has expired. Please log in again.', {
        style: errorToastStyle,
      });
    }
  }, [reason]);
  return (
    <>
      {isError && <RenderApiError error={error} />}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input
                    className="h-11"
                    placeholder="Enter your email"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="h-11 w-full"
            disabled={!form.formState.isValid || isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <Link
          className="font-medium text-blue-600 text-sm hover:text-blue-500"
          href="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
    </>
  );
}
