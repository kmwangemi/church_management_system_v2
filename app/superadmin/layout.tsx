import { SuperAdminClient } from '@/components/superadmin/superadmin-client';
import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import type React from 'react';

export default async function SuperAdminLayout({
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
  if (user.role !== 'SUPER_ADMIN') {
    redirect('/auth/login');
  }
  return <SuperAdminClient user={user}>{children}</SuperAdminClient>;
}
