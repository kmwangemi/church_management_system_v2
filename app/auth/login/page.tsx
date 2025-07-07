'use client';

import RenderApiError from '@/components/ApiError';
import { PasswordInput } from '@/components/password-input';
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
import { useLogin } from '@/lib/hooks/auth/use-login';
import { LoginPayload, loginSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Church, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
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
    } else if (result && result.user.role === 'member') {
      router.push('/member');
    } else {
      router.push('/dashboard');
    }
    reset();
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='shadow-xl border-0'>
          <CardHeader className='text-center pb-8'>
            <div className='flex items-center justify-center space-x-2 mb-6'>
              <div className='bg-blue-600 p-2 rounded-lg'>
                <Church className='h-8 w-8 text-white' />
              </div>
              <span className='text-2xl font-bold text-gray-900'>
                ChurchFlow
              </span>
            </div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Welcome Back
            </CardTitle>
            <CardDescription className='text-gray-600'>
              Sign in to your church management account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isError && <RenderApiError error={error} />}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700'>
                        Email Address
                      </FormLabel>
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
                        <PasswordInput
                          placeholder='Enter your password'
                          {...field}
                        />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
