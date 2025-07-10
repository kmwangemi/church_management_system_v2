'use client';

import RenderApiError from '@/components/ApiError';
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
import { LoginPayload, loginSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const router = useRouter();
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    mutateAsync: loginMutation,
    isPending: isPending,
    isError: isError,
    error: error,
  } = useLogin();
  const { reset } = form;
  const onSubmit = async (payload: LoginPayload) => {
    const result = await loginMutation(payload);
    if (result && result.user.role === 'superadmin') {
      router.push('/superadmin');
    } else if (result && result.user.role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/member');
    }
    reset();
    // Add reload after a short delay (2 seconds)
    setTimeout(() => {
      window.location.reload();
    }, 2000);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-gray-700'>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Enter your email'
                    className='h-11'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='Enter your password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='w-full h-11'
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
      <div className='mt-4 text-center'>
        <Link
          href='/auth/forgot-password'
          className='text-sm text-blue-600 hover:text-blue-500 font-medium'
        >
          Forgot password?
        </Link>
      </div>
    </>
  );
}
