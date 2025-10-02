// ============================================
// LIVINNING - Página de Favoritos
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/types';
import { PropertyCard } from '@/components/properties/property-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FavoriteItem {
  favoriteId: string;
  addedAt: Date;
  property: Property;
}

/**
 * Página de Favoritos del Usuario
 * Principio de Responsabilidad Única: Solo muestra las propiedades favoritas
 */
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/favorites/list');
        const data = await response.json();

        if (data.success) {
          setFavorites(data.data.favorites || []);
        } else {
          toast.error('Error al cargar favoritos');
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Error al cargar favoritos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-neutral-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Mis Favoritos</h1>
            <p className="text-neutral-600 mt-1">
              {favorites.length === 0
                ? 'No tienes propiedades favoritas'
                : `${favorites.length} propiedad${favorites.length !== 1 ? 'es' : ''} guardada${favorites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <Alert className="max-w-2xl">
          <Heart className="h-4 w-4" />
          <AlertDescription>
            Aún no has agregado propiedades a tus favoritos.
            <br />
            Explora las propiedades disponibles y haz clic en el ícono de corazón para guardarlas aquí.
          </AlertDescription>
        </Alert>
      ) : (
        /* Grid de Propiedades */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <PropertyCard
              key={item.property.id}
              id={item.property.id}
              title={item.property.title}
              price={item.property.price}
              currency={item.property.currency}
              images={item.property.images}
              address={item.property.address}
              city={item.property.city}
              state={item.property.state}
              propertyType={item.property.propertyType}
              transactionType={item.property.transactionType}
              bedrooms={item.property.bedrooms}
              bathrooms={item.property.bathrooms}
              area={item.property.area}
              parkingSpaces={item.property.parkingSpaces}
              views={item.property.views}
              ownerName={item.property.ownerName}
              ownerType={item.property.ownerType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
