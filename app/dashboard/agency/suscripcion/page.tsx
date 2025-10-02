// ============================================
// LIVINNING - Suscripción Page (Airbnb Style)
// ============================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 299,
    icon: Zap,
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 50 propiedades',
      'Analíticas básicas',
      'Soporte por email',
      'Fotos ilimitadas',
      'Filtros de búsqueda',
    ],
    popular: false,
    priceId: 'price_basic_monthly',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    icon: Star,
    description: 'Ideal para agencias en crecimiento',
    features: [
      'Propiedades ilimitadas',
      'Analíticas avanzadas',
      'Soporte prioritario 24/7',
      'Fotos y videos ilimitados',
      'Destacar propiedades',
      'Reportes personalizados',
      'Integración WhatsApp',
      'Tour virtual 3D',
    ],
    popular: true,
    priceId: 'price_premium_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    icon: Crown,
    description: 'Para agencias profesionales',
    features: [
      'Todo de Premium',
      'Múltiples usuarios',
      'API access',
      'Gestor de cuenta dedicado',
      'Branding personalizado',
      'Integraciones avanzadas',
      'Capacitación personalizada',
      'SLA garantizado',
    ],
    popular: false,
    priceId: 'price_enterprise_monthly',
  },
];

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planId: string) => {
    setIsLoading(planId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const data = await response.json();
        toast.error(data.error?.message || 'Error al crear sesión de pago');
      }
    } catch (error) {
      toast.error('Error al crear sesión de pago');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 gradient-gold-orange text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
          <Sparkles className="h-4 w-4" />
          Prueba gratis por 14 días
        </div>
        <h1 className="text-5xl font-bold text-neutral-800">Elige tu plan</h1>
        <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
          Comienza con una prueba gratuita de 14 días. Sin tarjeta de crédito requerida.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={cn(
                'card-airbnb relative',
                plan.popular && 'border-2 border-primary-500 shadow-hover scale-105'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-pink-coral text-white px-4 py-1.5 text-sm shadow-md hover:opacity-90">
                    Más popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center',
                    plan.id === 'basic' && 'bg-blue-violet-light',
                    plan.id === 'premium' && 'gradient-pink-coral shadow-lg',
                    plan.id === 'enterprise' && 'bg-purple-vibrant-light'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-7 w-7',
                      plan.id === 'basic' && 'text-blue-violet',
                      plan.id === 'premium' && 'text-white',
                      plan.id === 'enterprise' && 'text-purple-vibrant'
                    )}
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-neutral-800">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-neutral-500 mt-2 min-h-[40px]">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-neutral-800">${plan.price}</span>
                  <span className="text-neutral-500 text-lg ml-2">/mes</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">+ IVA</p>
              </CardHeader>

              <CardContent className="space-y-6 px-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button
                  className={cn(
                    'w-full h-12 font-semibold text-base',
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  )}
                  onClick={() => handleCheckout(plan.priceId, plan.id)}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? 'Procesando...' : 'Comenzar prueba gratis'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <div className="bg-neutral-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Todos los planes incluyen
          </h2>
          <p className="text-neutral-500">
            Características premium para impulsar tu negocio inmobiliario
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gold-yellow-light rounded-xl flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-gold-yellow" />
            </div>
            <h3 className="font-semibold text-neutral-800">Sin comisiones</h3>
            <p className="text-sm text-neutral-500">0% de comisión en tus ventas</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-violet-light rounded-xl flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-blue-violet" />
            </div>
            <h3 className="font-semibold text-neutral-800">Cancela cuando quieras</h3>
            <p className="text-sm text-neutral-500">Sin contratos ni permanencias</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-coral-red-light rounded-xl flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6 text-coral-red" />
            </div>
            <h3 className="font-semibold text-neutral-800">Actualizaciones gratis</h3>
            <p className="text-sm text-neutral-500">Nuevas funciones constantemente</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="text-center space-y-4 pt-8 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800">¿Tienes preguntas?</h3>
        <p className="text-neutral-500">
          Nuestro equipo está listo para ayudarte.{' '}
          <a href="/help" className="text-primary-500 hover:text-primary-600 font-semibold">
            Contáctanos
          </a>{' '}
          o consulta nuestras{' '}
          <a href="/faq" className="text-primary-500 hover:text-primary-600 font-semibold">
            preguntas frecuentes
          </a>
        </p>
      </div>
    </div>
  );
}
