/** biome-ignore-all assist/source/organizeImports: ignore sorting imports */
import { AppInitializer } from '@/components/app-initializer';
import ErrorBoundary from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from '@/providers/query-provider';
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <QueryProvider>
            <ErrorBoundary>
              <AuthProvider>
                <AppInitializer>{children}</AppInitializer>
              </AuthProvider>
            </ErrorBoundary>
          </QueryProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: '#f9fafb',
                color: '#111827',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
