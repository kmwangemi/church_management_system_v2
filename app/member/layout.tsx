import { BrandedLoader } from '@/components/branded-loader';
import { MemberClient } from '@/components/member/member-client';
import { SessionLoader } from '@/components/session-loader';
import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import type React from 'react';

export default async function MemberLayout({
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
  if (user.role !== 'MEMBER') {
    redirect('/auth/login');
  }
  return (
    <SessionLoader
      fallback={
        <BrandedLoader
          brandName="Church Hub"
          logo="/placeholder.svg"
          message="Preparing your workspace..."
        />
      }
      requireAuth={true}
    >
      <MemberClient user={user}>{children}</MemberClient>
    </SessionLoader>
  );
}
