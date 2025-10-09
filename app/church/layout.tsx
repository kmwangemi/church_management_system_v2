import { ChurchClient } from '@/components/church/church-client';
import { SessionLoader } from '@/components/session-loader';
import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import type React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;
  // Redirect if no user
  if (!user) {
    redirect('/auth/login');
  }
  if (user.role !== 'ADMIN') {
    redirect('/auth/login');
  }
  return (
    <SessionLoader
      requireAuth={true}
      // fallback={
      //   <BrandedLoader
      //     logo="/logo.png"
      //     brandName="My Church App"
      //     message="Preparing your workspace..."
      //   />
      // }
    >
      <ChurchClient user={user}>{children}</ChurchClient>
    </SessionLoader>
  );
}
