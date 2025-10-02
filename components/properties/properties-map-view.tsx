// ============================================
// LIVINNING - Properties Map View (Zillow-style)
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { Property } from '@/types';
import { PropertyCard } from './property-card';
import { PropertyMap } from './property-map';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface PropertiesMapViewProps {
  initialProperties: Property[];
  total: number;
}

/**
 * Vista de mapa estilo Zillow
 * Mapa a la izquierda (sticky), propiedades a la derecha
 * Principio de Responsabilidad Única: Coordina la vista de mapa y grid
 */
export function PropertiesMapView({ initialProperties, total }: PropertiesMapViewProps) {
  const [visibleProperties, setVisibleProperties] = useState<Property[]>(initialProperties);

  // Filtrar propiedades cuando el mapa cambia de bounds
  const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBounds) => {
    const filtered = initialProperties.filter((property) => {
      if (!property.coordinates?.lat || !property.coordinates?.lng) {
        return false;
      }

      const position = new google.maps.LatLng(
        property.coordinates.lat,
        property.coordinates.lng
      );

      return bounds.contains(position);
    });

    setVisibleProperties(filtered);
  }, [initialProperties]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Mapa - Izquierda (Sticky) */}
      <div className="w-2/5 sticky top-[72px] h-full">
        <PropertyMap
          properties={initialProperties}
          onBoundsChanged={handleBoundsChanged}
          className="h-full rounded-lg overflow-hidden shadow-lg"
        />
      </div>

      {/* Grid de Propiedades - Derecha (Scrollable) */}
      <div className="w-3/5 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-neutral-900">
            {visibleProperties.length} de {total} Propiedad{total !== 1 ? 'es' : ''} Disponible{total !== 1 ? 's' : ''}
          </h2>
          <p className="text-neutral-600 text-sm mt-1">
            Mostrando propiedades en el área visible del mapa
          </p>
        </div>

        {visibleProperties.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No hay propiedades en esta área del mapa.
              <br />
              Mueve o amplía el mapa para ver más propiedades.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
            {visibleProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                currency={property.currency}
                images={property.images}
                address={property.address}
                city={property.city}
                state={property.state}
                propertyType={property.propertyType}
                transactionType={property.transactionType}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                parkingSpaces={property.parkingSpaces}
                views={property.views}
                ownerName={property.ownerName}
                ownerType={property.ownerType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
