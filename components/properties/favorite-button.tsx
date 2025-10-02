// ============================================
// LIVINNING - Favorite Button (Airbnb Style)
// ============================================

'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ propertyId, initialFavorited = false, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // No navegar si está en un Link
    e.stopPropagation(); // No activar eventos padre

    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      } else {
        const data = await response.json();
        toast.error(data.error?.message || 'Error al actualizar favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        'w-10 h-10 rounded-full transition-all duration-200 hover:scale-110',
        isFavorited
          ? 'bg-white text-error-500 hover:bg-white/95'
          : 'bg-white/90 hover:bg-white text-neutral-600',
        className
      )}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all duration-200',
          isFavorited && 'fill-current scale-110'
        )}
      />
    </Button>
  );
}
