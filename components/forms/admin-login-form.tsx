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
import type { User } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { successToastStyle } from '@/lib/toast-styles';
// import { useLogin } from '@/lib/hooks/auth/use-login-queries';
import { type LoginPayload, loginSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  // const { mutateAsync: loginMutation, isPending, isError, error } = useLogin();
  // const { reset } = form;
  // const onSubmit = async (payload: LoginPayload) => {
  //   const result = await loginMutation(payload);
  //   if (!result) return; // Handle case where login fails
  //   // Reset form before navigation
  //   reset();
  //   // Determine redirect path
  //   let redirectPath = '/church'; // default
  //   if (result.user.role === 'superadmin') {
  //     redirectPath = '/superadmin';
  //   } else if (result.user.role === 'admin') {
  //     redirectPath = '/church';
  //   }
  //   // Use window.location for a hard redirect instead of router.push
  //   // This ensures a fresh page load and clears any cached state
  //   window.location.href = redirectPath;
  // };

  const onSubmit = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error, data } = await authClient.signIn.email({
        email: payload.email,
        password: payload.password,
        callbackURL: '/church', // Default redirect
      });
      // Check for errors in the response
      if (error) {
        setError(
          error.message || 'Login failed. Please check your credentials.'
        );
        setIsLoading(false);
        return;
      }
      // Success
      form.reset();
      toast.success('Signed in successfully!', {
        style: successToastStyle,
      });
      // Determine redirect based on user role
      const user = data?.user as User;
      let redirectPath = '/church';
      if (user?.role === 'SUPER_ADMIN') {
        redirectPath = '/superadmin';
      } else if (user?.role === 'VISITOR') {
        redirectPath = '/dashboard';
      }
      // Hard redirect to ensure fresh state
      window.location.href = redirectPath;
    } catch (err) {
      // Handle unexpected errors
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';

      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <>
      {error && <RenderApiError error={error} />}
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
            disabled={!form.formState.isValid || isLoading}
            type="submit"
          >
            {isLoading ? (
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
