import { auth, type ISession } from '@/lib/auth';
import { headers } from 'next/headers';
import { cache } from 'react';

export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session as ISession | null;
});
