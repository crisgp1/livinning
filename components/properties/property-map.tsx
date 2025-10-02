// ============================================
// LIVINNING - Property Map Component
// ============================================

'use client';

import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { Property } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bed, Bath, Maximize } from 'lucide-react';

interface PropertyMapProps {
  properties: Property[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

// Centro de México por defecto
const defaultCenter = {
  lat: 23.6345,
  lng: -102.5528,
};

const defaultZoom = 5;

/**
 * Mapa de propiedades con Google Maps
 * Principio de Responsabilidad Única: Solo maneja la visualización de propiedades en mapa
 */
export function PropertyMap({ properties }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Filtrar propiedades que tienen coordenadas
  const propertiesWithCoordinates = useMemo(() => {
    return properties.filter(
      (property) => property.coordinates?.lat && property.coordinates?.lng
    );
  }, [properties]);

  // Calcular el centro del mapa basado en las propiedades
  const mapCenter = useMemo(() => {
    if (propertiesWithCoordinates.length === 0) {
      return defaultCenter;
    }

    if (propertiesWithCoordinates.length === 1) {
      return {
        lat: propertiesWithCoordinates[0].coordinates!.lat,
        lng: propertiesWithCoordinates[0].coordinates!.lng,
      };
    }

    // Calcular el centro promedio
    const avgLat =
      propertiesWithCoordinates.reduce((sum, p) => sum + p.coordinates!.lat, 0) /
      propertiesWithCoordinates.length;
    const avgLng =
      propertiesWithCoordinates.reduce((sum, p) => sum + p.coordinates!.lng, 0) /
      propertiesWithCoordinates.length;

    return { lat: avgLat, lng: avgLng };
  }, [propertiesWithCoordinates]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Si hay propiedades, ajustar el zoom para mostrarlas todas
    if (propertiesWithCoordinates.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      propertiesWithCoordinates.forEach((property) => {
        if (property.coordinates) {
          bounds.extend({
            lat: property.coordinates.lat,
            lng: property.coordinates.lng,
          });
        }
      });
      map.fitBounds(bounds);
    }
  }, [propertiesWithCoordinates]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const propertyTypeLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Departamento',
    land: 'Terreno',
    commercial: 'Local Comercial',
    office: 'Oficina',
  };

  if (!apiKey) {
    return (
      <div className="w-full h-[600px] bg-neutral-100 rounded-lg flex items-center justify-center">
        <p className="text-neutral-500">
          Error: API key de Google Maps no configurada
        </p>
      </div>
    );
  }

  if (propertiesWithCoordinates.length === 0) {
    return (
      <div className="w-full h-[600px] bg-neutral-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-neutral-900 font-semibold">
            No hay propiedades con ubicación disponible
          </p>
          <p className="text-neutral-500 text-sm">
            Las propiedades sin coordenadas geográficas no se pueden mostrar en el mapa
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {propertiesWithCoordinates.map((property) => (
          <Marker
            key={property.id}
            position={{
              lat: property.coordinates!.lat,
              lng: property.coordinates!.lng,
            }}
            onClick={() => setSelectedProperty(property)}
            icon={{
              url: property.transactionType === 'rent'
                ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        ))}

        {selectedProperty && selectedProperty.coordinates && (
          <InfoWindow
            position={{
              lat: selectedProperty.coordinates.lat,
              lng: selectedProperty.coordinates.lng,
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <Card className="border-0 shadow-none max-w-xs">
              <Link href={`/propiedades/${selectedProperty.id}`}>
                <div className="space-y-2">
                  {/* Imagen */}
                  {selectedProperty.images.length > 0 && (
                    <img
                      src={selectedProperty.images[0]}
                      alt={selectedProperty.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}

                  {/* Badges */}
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {propertyTypeLabels[selectedProperty.propertyType] ||
                        selectedProperty.propertyType}
                    </Badge>
                    <Badge
                      variant={
                        selectedProperty.transactionType === 'rent'
                          ? 'default'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {selectedProperty.transactionType === 'rent' ? 'Renta' : 'Venta'}
                    </Badge>
                  </div>

                  {/* Título */}
                  <h3 className="font-semibold text-sm line-clamp-2 text-neutral-900">
                    {selectedProperty.title}
                  </h3>

                  {/* Precio */}
                  <p className="text-lg font-bold text-primary">
                    {selectedProperty.currency} {selectedProperty.price.toLocaleString()}
                    {selectedProperty.transactionType === 'rent' && '/mes'}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-3 text-neutral-600 text-xs">
                    {selectedProperty.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        <span>{selectedProperty.bedrooms}</span>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        <span>{selectedProperty.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Maximize className="h-3 w-3" />
                      <span>{selectedProperty.area} m²</span>
                    </div>
                  </div>

                  <p className="text-xs text-blue-600 hover:underline">
                    Ver detalles →
                  </p>
                </div>
              </Link>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
