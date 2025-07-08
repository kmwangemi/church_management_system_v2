import LoginForm from '@/components/forms/login-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Church } from 'lucide-react';
import { Suspense } from 'react';

export default function LoginPage() {
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
            <Suspense fallback={<SpinnerLoader />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
