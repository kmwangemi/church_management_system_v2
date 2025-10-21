import { BrandedLoader } from '@/components/branded-loader';
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

  const userMaritalstatus = session?.user?.maritalStatus;
  console.log('userMaritalstatus--->', userMaritalstatus);
  // const user = session?.memberRole;
  // Redirect if no user
  if (!user) {
    redirect('/auth/login');
  }
  // organizationRoles may be string[] | null | undefined — ensure ADMIN is present
  // if (
  //   !(
  //     Array.isArray(user.organizationRoles) &&
  //     user.organizationRoles.includes('ADMIN')
  //   )
  // ) {
  //   redirect('/auth/login');
  // }
  return (
    <SessionLoader
      fallback={
        <BrandedLoader
          brandName="Church Hub"
          logo="/placeholder.svg"
          message="Preparing your workspace..."
          showProgress={true}
        />
      }
      requireAuth={true}
    >
      <ChurchClient user={user}>{children}</ChurchClient>
    </SessionLoader>
  );
}
