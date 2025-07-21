import { Church } from 'lucide-react';
import { Suspense } from 'react';
import LoginForm from '@/components/forms/login-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-8 text-center">
            <div className="mb-6 flex items-center justify-center space-x-2">
              <div className="rounded-lg bg-blue-600 p-2">
                <Church className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">
                ChurchFlow
              </span>
            </div>
            <CardTitle className="font-bold text-2xl text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
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
