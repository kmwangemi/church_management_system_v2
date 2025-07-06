'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
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
        },
      }),
    }).catch(console.error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary'>
          <h2>Something went wrong.</h2>
          <p>An error occurred. Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
