// ============================================
// LIVINNING - Manual Upgrade Button (TEMPORAL)
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ManualUpgradeButtonProps {
  packageType: string;
}

export function ManualUpgradeButton({ packageType }: ManualUpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleManualUpgrade = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/manual-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('¡Cuenta actualizada exitosamente!');
        // Esperar un poco para que Clerk sincronice
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        toast.error(data.error || 'Error al actualizar cuenta');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManualUpgrade}
      disabled={isLoading}
      size="sm"
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Actualizando...' : 'Actualizar ahora'}
    </Button>
  );
}
