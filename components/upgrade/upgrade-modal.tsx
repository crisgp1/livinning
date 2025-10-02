// ============================================
// LIVINNING - Modal de Upgrade
// ============================================

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, TrendingUp, Building2 } from 'lucide-react';
import { UpgradePackage } from '@/types/upgrade';
import { UPGRADE_PACKAGES } from '@/lib/utils/upgrade-plans';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
  userId: string;
  currentProperties?: number;
}

/**
 * Modal de Upgrade - Muestra opciones de paquetes al usuario
 * Principio Open/Closed: Abierto para extensión (nuevos paquetes) pero cerrado para modificación
 */
export function UpgradeModal({
  open,
  onOpenChange,
  userEmail,
  userName,
  userId,
  currentProperties = 0,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = async (pkg: UpgradePackage) => {
    setIsLoading(true);
    setSelectedPackage(pkg.id);

    try {
      console.log('Iniciando checkout para paquete:', pkg.id);

      const requestBody = {
        packageType: pkg.id,
        userId,
        userEmail,
        userName,
      };

      console.log('Request body:', requestBody);

      const response = await fetch('/api/create-property-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success && data.data?.url) {
        console.log('Redirigiendo a Stripe Checkout...', data.data.url);
        // Asignar directamente la URL sin esperar
        window.location.href = data.data.url;
        // No ejecutar nada más después de la redirección
        return;
      } else {
        const errorMessage = data.error?.message || 'Error al procesar el pago';
        console.error('Error en respuesta:', errorMessage);
        toast.error(errorMessage);
        setSelectedPackage(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Error de conexión al procesar el pago');
      setSelectedPackage(null);
      setIsLoading(false);
    }
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'single':
        return <Sparkles className="h-5 w-5" />;
      case 'package_5':
        return <TrendingUp className="h-5 w-5" />;
      case 'agency':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Continúa publicando propiedades</DialogTitle>
          <DialogDescription>
            Has alcanzado el límite de {currentProperties} propiedad{currentProperties > 1 ? 'es' : ''} gratis.
            Elige un plan para continuar publicando.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {UPGRADE_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                'relative transition-all hover:shadow-lg',
                pkg.recommended && 'border-primary ring-2 ring-primary/20'
              )}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {pkg.badge}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                  {getPackageIcon(pkg.id)}
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Precio */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${pkg.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">
                      {pkg.id === 'agency' ? '/mes' : 'MXN'}
                    </span>
                  </div>
                  {pkg.pricePerProperty && pkg.pricePerProperty > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${pkg.pricePerProperty.toLocaleString()} por propiedad
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={isLoading}
                  className={cn(
                    'w-full',
                    pkg.recommended && 'bg-primary hover:bg-primary/90'
                  )}
                  variant={pkg.recommended ? 'default' : 'outline'}
                >
                  {isLoading && selectedPackage === pkg.id
                    ? 'Procesando...'
                    : pkg.id === 'agency'
                    ? 'Convertirse en Agencia'
                    : 'Seleccionar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Todos los pagos son seguros y procesados a través de Stripe.
            Puedes cancelar en cualquier momento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
