// ============================================
// LIVINNING - Dashboard Page (Dynamic per Role)
// ============================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDashboardConfig } from '@/lib/dashboard/config';
import { UserRole } from '@/types';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ManualUpgradeButton } from '@/components/upgrade/manual-upgrade-button';
import { VerificationAlert } from '@/components/agency/verification-alert';
import { VerificationStatus } from '@/types/verification';

interface DashboardPageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ upgrade?: string; package?: string }>;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/');
  }

  // Get search params
  const { upgrade, package: packageType } = await searchParams;
  const showUpgradeSuccess = upgrade === 'success';

  // Get actual user role
  const actualUserRole = ((user.publicMetadata?.role as string)?.toUpperCase() as UserRole) || 'USER';
  const isSuperAdmin = actualUserRole === 'SUPERADMIN';

  // Get requested role from URL
  const { role: requestedRoleParam } = await params;
  const requestedRole = (requestedRoleParam.toUpperCase() as UserRole);

  // Get config for the requested role (SUPERADMIN can view any role's dashboard)
  const displayRole = isSuperAdmin ? requestedRole : actualUserRole;
  const config = getDashboardConfig(displayRole);

  // If config is not found, redirect to default role
  if (!config) {
    redirect('/dashboard/user');
  }

  // Build user object for dashboard
  const dashboardUser = {
    id: user.id,
    name: user.fullName || user.firstName || 'Usuario',
    email: user.primaryEmailAddress?.emailAddress || '',
    role: displayRole, // Use the display role (for SUPERADMIN viewing other dashboards)
    propertyCount: (user.publicMetadata?.propertyCount as number) || 0,
    propertyLimit: (user.publicMetadata?.propertyLimit as number) || 1,
    subscriptionStatus: (user.publicMetadata?.subscriptionStatus as string) || 'inactive',
    referralCode: (user.publicMetadata?.referralCode as string) || '',
  };

  // Agency verification status
  const verificationStatus = (user.publicMetadata?.verificationStatus as VerificationStatus) || 'pending';
  const isVerified = (user.publicMetadata?.isVerified as boolean) || false;
  const verificationData = user.publicMetadata?.verificationData as any;

  // Mensaje de éxito del paquete
  const getUpgradeSuccessMessage = (pkg?: string) => {
    switch (pkg) {
      case 'single':
        return 'Has adquirido 1 propiedad adicional. Ya puedes publicar más propiedades.';
      case 'package_5':
        return 'Has adquirido el paquete de 5 propiedades. Ya puedes publicar más propiedades.';
      case 'agency':
        return '¡Bienvenido como Agencia! Ahora puedes publicar propiedades ilimitadas.';
      default:
        return 'Upgrade exitoso. Tu cuenta ha sido actualizada.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Success Alert */}
      {showUpgradeSuccess && (
        <Alert className="border-green-500/30 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-neutral-700 flex items-center justify-between">
            <span>{getUpgradeSuccessMessage(packageType)}</span>
            {packageType && dashboardUser.propertyLimit === 1 && (
              <ManualUpgradeButton packageType={packageType} />
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* SUPERADMIN viewing another role */}
      {isSuperAdmin && displayRole !== 'SUPERADMIN' && (
        <Alert className="border-purple-vibrant/30 bg-purple-vibrant/5">
          <ShieldAlert className="h-4 w-4 text-purple-vibrant" />
          <AlertDescription className="text-neutral-700">
            Estás viendo el dashboard como <strong>{displayRole}</strong>. Tu rol real es{' '}
            <strong>SUPERADMIN</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Agency Verification Alert */}
      {displayRole === 'AGENCY' && (
        <VerificationAlert
          status={verificationStatus}
          isVerified={isVerified}
          rejectionReason={verificationData?.rejectionReason}
        />
      )}

      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Bienvenido, {dashboardUser.name}
        </h1>
        <p className="text-neutral-600 mt-2">{config.description}</p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-bright/30 bg-blue-bright/5">
        <Info className="h-4 w-4 text-blue-bright" />
        <AlertDescription className="text-neutral-700">
          {displayRole === 'USER' && (
            <>
              Puedes publicar hasta <strong>{dashboardUser.propertyLimit} propiedad(es)</strong>. Actualmente tienes{' '}
              <strong>{dashboardUser.propertyCount || 0}</strong> propiedad(es) publicada(s).
              {dashboardUser.propertyLimit > 1 && (
                <span className="text-green-600 ml-1">
                  (Has adquirido propiedades adicionales)
                </span>
              )}
            </>
          )}
          {displayRole === 'AGENCY' && (
            <>
              Como agencia, tienes acceso a <strong>propiedades ilimitadas</strong> y analíticas
              avanzadas. Estado de suscripción:{' '}
              <strong className="capitalize">{dashboardUser.subscriptionStatus || 'inactiva'}</strong>.
            </>
          )}
          {displayRole === 'PARTNER' && (
            <>
              Como socio, ganas <strong>10% de comisión</strong> por cada agencia que refiera.
              Tu código de referido es: <strong>{dashboardUser.referralCode}</strong>.
            </>
          )}
          {displayRole === 'HELPDESK' && (
            <>
              Como soporte, puedes gestionar tickets y ayudar a los usuarios. Recuerda mantener un
              tiempo de respuesta rápido.
            </>
          )}
          {(displayRole === 'ADMIN' || displayRole === 'SUPERADMIN') && (
            <>
              Como {displayRole === 'SUPERADMIN' ? 'superadministrador' : 'administrador'}, tienes
              acceso completo al sistema. Úsalo responsablemente.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Dashboard Content - Role-based Widgets */}
      <DashboardContent user={dashboardUser} config={config} />
    </div>
  );
}
