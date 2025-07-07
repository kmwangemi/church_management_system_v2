import ErrorBoundary from '@/components/ErrorBoundary';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Church Management System',
    default: 'Church Management System',
  },
  description: 'Church Management Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </QueryProvider>
          <Toaster
            position='bottom-right'
            toastOptions={{
              style: {
                backgroundColor: '#f9fafb', // Tailwind gray-50
                color: '#111827', // Tailwind gray-900
                border: '1px solid #e5e7eb', // Tailwind gray-200
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
