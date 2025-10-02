// LIVINNING - Partner Dashboard Layout

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface PartnerLayoutProps {
  children: ReactNode;
}

export default async function PartnerLayout({ children }: PartnerLayoutProps) {
  // Get authentication from Clerk
  const { userId } = await auth();
  const user = await currentUser();

  // If not authenticated, redirect to home (middleware should handle this)
  if (!userId || !user) {
    redirect('/');
  }

  // Get user role from Clerk publicMetadata
  const userRole = ((user.publicMetadata?.role as string)?.toLowerCase()) || 'user';

  // SUPERADMIN can access all dashboards
  const isSuperAdmin = userRole === 'superadmin';

  // Verify that the user is a partner (unless SUPERADMIN)
  if (!isSuperAdmin && userRole !== 'partner') {
    // Redirect to their correct dashboard
    redirect(`/dashboard/${userRole}`);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
