// ============================================
// LIVINNING - Properties Widget (Airbnb Style)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, MapPin, Eye, Edit, Trash2, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyCardData {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  status: 'active' | 'pending' | 'rejected';
  views: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface PropertiesWidgetProps {
  properties: PropertyCardData[];
  title?: string;
  viewAllHref?: string;
}

export function PropertiesWidget({
  properties,
  title = 'Mis Propiedades',
  viewAllHref,
}: PropertiesWidgetProps) {
  return (
    <Card className="card-airbnb">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600 hover:bg-primary-50">
              Ver todas
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium mb-1">No hay propiedades aún</p>
            <p className="text-sm text-neutral-500">Comienza publicando tu primera propiedad</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PropertyCard({ property }: { property: PropertyCardData }) {
  const statusConfig = {
    active: { label: 'Activa', className: 'bg-success-500 hover:bg-success-500' },
    pending: { label: 'Pendiente', className: 'bg-warning-500 hover:bg-warning-500' },
    rejected: { label: 'Rechazada', className: 'bg-error-500 hover:bg-error-500' },
  };

  return (
    <Link href={`/dashboard/propiedades/${property.id}`} className="group block">
      <div className="card-airbnb overflow-hidden hover:shadow-hover transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn('text-white font-medium', statusConfig[property.status].className)}>
              {statusConfig[property.status].label}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-3 left-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm h-8 w-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart className="mr-2 h-4 w-4" />
                  Estadísticas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-error-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-neutral-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>

          {/* Details */}
          {(property.bedrooms || property.bathrooms) && (
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              {property.bedrooms && <span>{property.bedrooms} hab.</span>}
              {property.bathrooms && <span>{property.bathrooms} baños</span>}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-800">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Eye className="h-3.5 w-3.5" />
              <span>{property.views}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
