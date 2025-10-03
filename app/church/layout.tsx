import { ChurchClient } from '@/components/church/church-client';
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
  return <ChurchClient user={user}>{children}</ChurchClient>;
}
