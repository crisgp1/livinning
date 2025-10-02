// ============================================
// LIVINNING - Subscription Status Widget
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionStatusWidgetProps {
  title: string;
  status: 'active' | 'inactive' | 'expired' | 'trial';
  plan?: {
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    renewDate?: string;
    features: string[];
  };
}

export function SubscriptionStatusWidget({ title, status, plan }: SubscriptionStatusWidgetProps) {
  const statusConfig = {
    active: {
      label: 'Activa',
      icon: CheckCircle2,
      className: 'bg-success-500 hover:bg-success-500 text-white',
      gradient: 'from-success-400 to-success-600',
    },
    trial: {
      label: 'Prueba Gratis',
      icon: AlertCircle,
      className: 'bg-blue-bright hover:bg-blue-bright text-white',
      gradient: 'from-blue-bright to-blue-violet',
    },
    inactive: {
      label: 'Inactiva',
      icon: AlertCircle,
      className: 'bg-warning-500 hover:bg-warning-500 text-white',
      gradient: 'from-gold-yellow to-coral-red',
    },
    expired: {
      label: 'Expirada',
      icon: AlertCircle,
      className: 'bg-error-500 hover:bg-error-500 text-white',
      gradient: 'from-coral-red to-pink-vibrant',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="card-airbnb overflow-hidden relative">
      {/* Gradient Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', config.gradient)} />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
          <Badge className={cn('font-medium', config.className)}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {status === 'active' || status === 'trial' ? (
          <>
            {/* Plan Info */}
            <div className="space-y-3">
              <div className={cn('p-4 rounded-xl bg-gradient-to-br', config.gradient)}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-white">${plan?.price}</span>
                  <span className="text-white/80 text-sm">
                    /{plan?.interval === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                <p className="text-white/90 text-sm font-medium">{plan?.name}</p>
              </div>

              {/* Renew Date */}
              {plan?.renewDate && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="h-4 w-4" />
                  <span>Renovación: {plan.renewDate}</span>
                </div>
              )}

              {/* Features */}
              <div className="space-y-2">
                {plan?.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <Link href="/dashboard/agency/suscripcion">
                <Button variant="outline" size="sm" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gestionar suscripción
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4', config.gradient)}>
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-800 font-semibold mb-1">
              {status === 'inactive' ? 'No tienes suscripción activa' : 'Tu suscripción ha expirado'}
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Activa tu plan para acceder a todas las funciones
            </p>
            <Link href="/dashboard/agency/suscripcion">
              <Button className={cn('bg-gradient-to-r', config.gradient)}>
                Ver planes
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
