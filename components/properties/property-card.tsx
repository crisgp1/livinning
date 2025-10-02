// ============================================
// LIVINNING - Property Card Component
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from './favorite-button';
import { MapPin, Bed, Bath, Maximize, Car, Eye } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  address: string;
  city: string;
  state: string;
  propertyType: string;
  transactionType: 'sale' | 'rent';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  parkingSpaces?: number;
  views: number;
  ownerName: string;
  ownerType: 'USER' | 'AGENCY';
  isVerified?: boolean;
}

/**
 * Tarjeta de propiedad reutilizable
 * Principio de Responsabilidad Única: Solo muestra información de una propiedad
 */
export function PropertyCard({
  id,
  title,
  price,
  currency,
  images,
  address,
  city,
  state,
  propertyType,
  transactionType,
  bedrooms,
  bathrooms,
  area,
  parkingSpaces,
  views,
  ownerName,
  ownerType,
  isVerified = false,
}: PropertyCardProps) {
  const mainImage = images[0] || '/placeholder-property.jpg';
  const priceLabel = transactionType === 'rent' ? `${currency} ${price.toLocaleString()}/mes` : `${currency} ${price.toLocaleString()}`;

  const propertyTypeLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Departamento',
    land: 'Terreno',
    commercial: 'Local Comercial',
    office: 'Oficina',
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-neutral-200">
      <Link href={`/propiedades/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="bg-white/90 text-neutral-900 hover:bg-white">
              {propertyTypeLabels[propertyType] || propertyType}
            </Badge>
            {isVerified && ownerType === 'AGENCY' && (
              <Badge className="bg-blue-600/90 text-white hover:bg-blue-700">
                Agencia Verificada
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton propertyId={id} />
          </div>

          {/* Views */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {views.toLocaleString()}
          </div>
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <Link href={`/propiedades/${id}`}>
          {/* Price */}
          <div className="mb-2">
            <p className="text-2xl font-bold text-neutral-900">{priceLabel}</p>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-neutral-600 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-neutral-600 text-sm pt-3 border-t border-neutral-200">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{area} m²</span>
            </div>
            {parkingSpaces && parkingSpaces > 0 && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{parkingSpaces}</span>
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="pt-2 text-xs text-neutral-500">
            {ownerType === 'AGENCY' ? 'Agencia' : 'Propietario'}: {ownerName}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
