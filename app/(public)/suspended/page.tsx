// ============================================
// LIVINNING - Cuenta Suspendida
// ============================================

'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ban, AlertTriangle, Mail, LogOut, Clock } from 'lucide-react';

/**
 * Página de Cuenta Suspendida
 * Muestra información sobre la suspensión y permite cerrar sesión
 */
export default function SuspendedPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [suspensionInfo, setSuspensionInfo] = useState({
    reason: '',
    suspendedAt: '',
    suspendedBy: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Verificar si realmente está suspendido
    const isSuspended = user.publicMetadata?.isSuspended;
    if (!isSuspended) {
      // Si no está suspendido, redirigir al dashboard
      const role = (user.publicMetadata?.role as string)?.toLowerCase() || 'user';
      router.push(`/dashboard/${role}`);
      return;
    }

    // Obtener información de suspensión
    setSuspensionInfo({
      reason: (user.publicMetadata?.suspensionReason as string) || 'Violación de términos de servicio',
      suspendedAt: (user.publicMetadata?.suspendedAt as string) || '',
      suspendedBy: (user.publicMetadata?.suspendedBy as string) || '',
    });
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <Card className="max-w-2xl w-full border-red-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
              <div className="relative bg-red-100 rounded-full p-6">
                <Ban className="h-16 w-16 text-red-600" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-900">
            Cuenta Suspendida
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Tu cuenta ha sido suspendida temporalmente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Acceso Restringido
              </p>
              <p className="text-sm text-red-700 mt-1">
                No puedes acceder a tu cuenta mientras esté suspendida. Si crees que esto es un error, contacta con soporte.
              </p>
            </div>
          </div>

          <Separator />

          {/* Suspension Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Detalles de la Suspensión
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Motivo:</span>
                </div>
                <p className="text-sm text-gray-900 pl-6">
                  {suspensionInfo.reason}
                </p>
              </div>

              {suspensionInfo.suspendedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Fecha de suspensión:</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6">
                    {new Date(suspensionInfo.suspendedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Support Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              ¿Necesitas Ayuda?
            </h3>
            <p className="text-sm text-gray-600">
              Si crees que esta suspensión es un error o deseas apelar, puedes contactar con nuestro equipo de soporte:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Soporte LIVINNING
              </p>
              <a
                href="mailto:support@livinning.com"
                className="text-sm text-blue-700 hover:text-blue-800 underline"
              >
                support@livinning.com
              </a>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Button
              onClick={() => window.open('mailto:support@livinning.com', '_blank')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
