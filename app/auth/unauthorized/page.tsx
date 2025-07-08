'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer that updates every second
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/auth/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(countdownTimer);
  }, [router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10'>
          {/* Icon */}
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6'>
            <svg
              className='h-8 w-8 text-red-600'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path d='M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0V9a4 4 0 018 0v2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2' />
            </svg>
          </div>
          {/* Title */}
          <h1 className='text-center text-2xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h1>
          {/* Message */}
          <p className='text-center text-gray-600 mb-6'>
            You don't have permission to access this resource. Please contact
            your administrator or try logging in with the appropriate
            credentials.
          </p>
          {/* Error Code */}
          <div className='text-center text-sm text-gray-500 mb-8'>
            Error Code: 401 - Unauthorized
          </div>
          {/* Action Buttons */}
          <div className='space-y-3'>
            <button
              onClick={handleLogin}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Sign In
            </button>
            <button
              onClick={handleGoHome}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Go to Home
            </button>
            <button
              onClick={handleGoBack}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Go Back
            </button>
          </div>
          {/* Auto-redirect notice with countdown */}
          <div className='mt-6 text-center text-xs text-gray-500'>
            You will be automatically redirected to the login page in{' '}
            <span className='font-medium text-blue-600'>{countdown}</span>
            {countdown === 1 ? ' second' : ' seconds'}
          </div>
        </div>
      </div>
    </div>
  );
}
