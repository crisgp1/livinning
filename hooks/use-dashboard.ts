// ============================================
// LIVINNING - Hook: useDashboard (with Clerk)
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { getDashboardConfig } from '@/lib/dashboard/config';
import { DashboardConfig } from '@/lib/dashboard/types';
import { UserRole } from '@/types';

interface UseDashboardReturn {
  config: DashboardConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);

  const config = useMemo(() => {
    if (!user) return null;

    try {
      const userRole = ((user.publicMetadata?.role as string)?.toUpperCase() as UserRole) || 'USER';
      return getDashboardConfig(userRole);
    } catch (err) {
      setError('Error al cargar configuración del dashboard');
      return null;
    }
  }, [user]);

  const refetch = async () => {
    setError(null);
    // Clerk handles user refetching automatically
  };

  return {
    config,
    isLoading: !isLoaded,
    error,
    refetch,
  };
}
