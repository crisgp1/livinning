// ============================================
// LIVINNING - Página de Verificación de Agencia
// ============================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { VerificationForm } from '@/components/agency/verification-form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Info } from 'lucide-react';
import { VerificationStatus } from '@/types/verification';

export default async function AgencyVerificationPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/');
  }

  const userRole = (user.publicMetadata?.role as string) || 'USER';

  // Solo agencias pueden acceder
  if (userRole !== 'AGENCY') {
    redirect('/dashboard/user');
  }

  const verificationStatus = (user.publicMetadata?.verificationStatus as VerificationStatus) || 'pending';
  const isVerified = (user.publicMetadata?.isVerified as boolean) || false;
  const verificationData = user.publicMetadata?.verificationData as any;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-neutral-900">
            Verificación de Agencia
          </h1>
        </div>
        <p className="text-neutral-600">
          Completa tu verificación para desbloquear todas las funcionalidades de tu cuenta de agencia
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500/30 bg-blue-500/5">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-neutral-700">
          La verificación es necesaria para publicar propiedades y acceder a todas las herramientas de agencia.
          El proceso toma entre 24-48 horas hábiles.
        </AlertDescription>
      </Alert>

      {/* Verification Status */}
      {verificationStatus === 'in_review' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto" />
              <h3 className="text-lg font-semibold">Verificación en Proceso</h3>
              <p className="text-neutral-600">
                Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email cuando esté lista.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === 'verified' && isVerified && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-green-600">¡Agencia Verificada!</h3>
              <p className="text-neutral-600">
                Tu agencia está completamente verificada. Ya puedes publicar propiedades ilimitadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      {(verificationStatus === 'pending' || verificationStatus === 'rejected') && (
        <>
          {verificationStatus === 'rejected' && verificationData?.rejectionReason && (
            <Alert className="border-red-500/30 bg-red-500/5">
              <AlertDescription className="text-neutral-700">
                <strong>Solicitud rechazada:</strong> {verificationData.rejectionReason}
                <br />
                Por favor, revisa los comentarios y vuelve a enviar tu solicitud.
              </AlertDescription>
            </Alert>
          )}

          <VerificationForm
            userId={userId}
            userEmail={user.primaryEmailAddress?.emailAddress || ''}
          />
        </>
      )}
    </div>
  );
}
