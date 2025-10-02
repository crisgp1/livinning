// ============================================
// LIVINNING - Alert de Verificación de Agencia
// ============================================

'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { VerificationStatus } from '@/types/verification';

interface VerificationAlertProps {
  status: VerificationStatus;
  isVerified: boolean;
  rejectionReason?: string;
}

/**
 * Alert discreto para mostrar el estado de verificación
 * Principio de Responsabilidad Única: Solo muestra el estado de verificación
 */
export function VerificationAlert({ status, isVerified, rejectionReason }: VerificationAlertProps) {
  // No mostrar nada si está verificada
  if (isVerified && status === 'verified') {
    return null;
  }

  const getAlertConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/5',
          title: 'Verificación Pendiente',
          description: 'Tu cuenta de agencia necesita ser verificada para publicar propiedades ilimitadas.',
          actionText: 'Completar Verificación',
          actionHref: '/dashboard/agency/verificacion',
          badge: { text: 'Acción Requerida', variant: 'warning' as const },
        };

      case 'in_review':
        return {
          icon: Clock,
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-blue-500/5',
          title: 'Verificación en Revisión',
          description: 'Estamos revisando tu solicitud de verificación. Te notificaremos cuando esté lista.',
          actionText: 'Ver Estado',
          actionHref: '/dashboard/agency/verificacion',
          badge: { text: 'En Proceso', variant: 'secondary' as const },
        };

      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          borderColor: 'border-red-500/30',
          bgColor: 'bg-red-500/5',
          title: 'Verificación Rechazada',
          description: rejectionReason || 'Tu solicitud fue rechazada. Por favor, revisa los comentarios y vuelve a intentar.',
          actionText: 'Revisar y Reenviar',
          actionHref: '/dashboard/agency/verificacion',
          badge: { text: 'Requiere Atención', variant: 'destructive' as const },
        };

      case 'verified':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-500/5',
          title: '¡Agencia Verificada!',
          description: 'Tu cuenta está completamente verificada. Ya puedes publicar propiedades ilimitadas.',
          actionText: null,
          actionHref: null,
          badge: { text: 'Verificada', variant: 'default' as const },
        };

      default:
        return null;
    }
  };

  const config = getAlertConfig();

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Alert className={`${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTitle className="text-sm font-semibold mb-0">
              {config.title}
            </AlertTitle>
            <Badge variant={config.badge.variant} className="text-xs">
              {config.badge.text}
            </Badge>
          </div>
          <AlertDescription className="text-sm text-muted-foreground">
            {config.description}
          </AlertDescription>
        </div>
        {config.actionText && config.actionHref && (
          <Link href={config.actionHref}>
            <Button size="sm" variant="outline">
              {config.actionText}
            </Button>
          </Link>
        )}
      </div>
    </Alert>
  );
}

/**
 * Badge de verificación para mostrar en el perfil/header
 */
export function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
      <span className="text-xs font-medium text-blue-600">Verificada</span>
    </div>
  );
}
