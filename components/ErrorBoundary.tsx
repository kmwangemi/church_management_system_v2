'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to database via API
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level: 'error',
        message: 'React Error Boundary caught an error',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        metadata: {
          componentStack: errorInfo.componentStack,
          source: 'client',
          errorId: this.state.errorId,
        },
      }),
    }).catch(console.error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/auth/login';
  };

  private handleReportError = () => {
    const subject = `Error Report - ${this.state.errorId}`;
    const body = `Error ID: ${this.state.errorId}\nError: ${this.state.error?.message}\nURL: ${window.location.href}\n\nPlease describe what you were doing when this error occurred:`;
    window.location.href = `mailto:support@yourcompany.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
          <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10'>
              {/* Error Icon */}
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
                  <path d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
              {/* Title */}
              <h1 className='text-center text-2xl font-bold text-gray-900 mb-2'>
                Oops! Something went wrong
              </h1>
              {/* Message */}
              <p className='text-center text-gray-600 mb-6'>
                We're sorry, but an unexpected error occurred. Our team has been
                notified and is working on a fix.
              </p>
              {/* Error ID */}
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='text-center'>
                  <p className='text-sm font-medium text-gray-900 mb-1'>
                    Error ID
                  </p>
                  <p className='text-xs text-gray-500 font-mono break-all'>
                    {this.state.errorId}
                  </p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className='space-y-3'>
                <button
                  onClick={this.handleReload}
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                    />
                  </svg>
                  Go to Home
                </button>
                <button
                  onClick={this.handleReportError}
                  className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Report Error
                </button>
              </div>
              {/* Additional Help */}
              <div className='mt-6 text-center'>
                <p className='text-xs text-gray-500'>
                  If the problem persists, please contact our support team with
                  the error ID above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
