'use client';

import AdminLoginForm from '@/components/forms/admin-login-form';
import MemberLoginForm from '@/components/forms/member-login-form';
import { SpinnerLoader } from '@/components/loaders/spinnerloader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Church } from 'lucide-react';
import { Suspense, useState } from 'react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('member');
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
                ChurchHub
              </span>
            </div>
            <CardTitle className="font-bold text-2xl text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your church management account
            </CardDescription>
          </CardHeader>
          {/* Tab Navigation */}
          <div className="mx-6 flex border-gray-200 border-b">
            <button
              className={`flex-1 border-b-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'member'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('member')}
              type="button"
            >
              Member Login
            </button>
            <button
              className={`flex-1 border-b-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'admin'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('admin')}
              type="button"
            >
              Admin Login
            </button>
          </div>
          <CardContent className="pt-6">
            <Suspense fallback={<SpinnerLoader />}>
              {activeTab === 'admin' ? <AdminLoginForm /> : <MemberLoginForm />}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
