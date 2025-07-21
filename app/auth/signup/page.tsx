'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Church, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    churchName: z.string().min(2, 'Church name is required'),
    churchSize: z.string().min(1, 'Please select church size'),
    role: z.string().min(1, 'Please select your role'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      churchName: '',
      churchSize: '',
      role: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });
  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError('');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Mock successful registration
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: data.email,
          role: data.role,
          name: `${data.firstName} ${data.lastName}`,
          churchName: data.churchName,
        })
      );
      router.push('/dashboard');
    } catch (_error) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6 text-center">
            <div className="mb-6 flex items-center justify-center space-x-2">
              <div className="rounded-lg bg-blue-600 p-2">
                <Church className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">
                ChurchFlow
              </span>
            </div>
            <CardTitle className="font-bold text-2xl text-gray-900">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Set up your church management system in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center font-semibold text-gray-900 text-lg">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
                      1
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your first name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your last name"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your phone number"
                              type="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Church Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center font-semibold text-gray-900 text-lg">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
                      2
                    </div>
                    Church Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="churchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your church name"
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
                      name="churchSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Size</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select church size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="small">
                                Small (1-100 members)
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium (101-500 members)
                              </SelectItem>
                              <SelectItem value="large">
                                Large (501-1000 members)
                              </SelectItem>
                              <SelectItem value="mega">
                                Mega (1000+ members)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pastor">Pastor</SelectItem>
                              <SelectItem value="bishop">Bishop</SelectItem>
                              <SelectItem value="admin">
                                Administrator
                              </SelectItem>
                              <SelectItem value="finance">
                                Finance Officer
                              </SelectItem>
                              <SelectItem value="secretary">
                                Secretary
                              </SelectItem>
                              <SelectItem value="staff">
                                Staff Member
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Security */}
                <div className="space-y-4">
                  <h3 className="flex items-center font-semibold text-gray-900 text-lg">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
                      3
                    </div>
                    Security
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Create a strong password"
                                type={showPassword ? 'text' : 'password'}
                                {...field}
                              />
                              <Button
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                size="sm"
                                type="button"
                                variant="ghost"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Confirm your password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...field}
                              />
                              <Button
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                size="sm"
                                type="button"
                                variant="ghost"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{' '}
                          <Link
                            className="text-blue-600 hover:underline"
                            href="/terms"
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            className="text-blue-600 hover:underline"
                            href="/privacy"
                          >
                            Privacy Policy
                          </Link>
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="h-11 w-full"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link
                  className="font-medium text-blue-600 hover:text-blue-500"
                  href="/auth/login"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
