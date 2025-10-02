// ============================================
// LIVINNING - Dashboard Layout Route
// ============================================

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface DashboardLayoutRouteProps {
  children: ReactNode;
  params: Promise<{ role: string }>;
}

export default async function DashboardLayoutRoute({
  children,
  params,
}: DashboardLayoutRouteProps) {
  // Get authentication from Clerk
  const { userId } = await auth();
  const user = await currentUser();

  // If not authenticated, redirect to home (middleware should handle this)
  if (!userId || !user) {
    redirect('/');
  }

  // Await params (Next.js 15)
  const { role } = await params;

  // Get user role from Clerk publicMetadata (normalize to lowercase for URL comparison)
  const userRole = ((user.publicMetadata?.role as string)?.toLowerCase()) || 'user';
  const requestedRole = role.toLowerCase();

  // SUPERADMIN can access all dashboards
  const isSuperAdmin = userRole === 'superadmin';

  // Verify that the role in the URL matches the user's role (unless SUPERADMIN)
  if (!isSuperAdmin && requestedRole !== userRole) {
    // Redirect to their correct dashboard
    redirect(`/dashboard/${userRole}`);
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
