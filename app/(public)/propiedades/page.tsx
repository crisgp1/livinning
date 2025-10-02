// ============================================
// LIVINNING - Página Pública de Propiedades
// ============================================

import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertiesMapView } from '@/components/properties/properties-map-view';
import { listProperties } from '@/lib/db/models/property';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface PropertiesPageProps {
  searchParams: Promise<{
    search?: string;
    city?: string;
    propertyType?: string;
    transactionType?: string;
    page?: string;
    sortBy?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;

  // Obtener TODAS las propiedades (sin paginación para el mapa)
  // El filtro por bounds se hace en el cliente
  const { properties, total } = await listProperties({
    status: 'active',
    city: params.city,
    propertyType: params.propertyType,
    transactionType: params.transactionType as 'sale' | 'rent' | undefined,
    page: 1,
    limit: 1000, // Límite alto para mostrar todas en el mapa
    sortBy: params.sortBy || 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Barra de Búsqueda - Sticky Top */}
      <PropertyFilters
        initialCity={params.city}
        initialPropertyType={params.propertyType}
        initialTransactionType={params.transactionType}
      />

      {/* Resultados - Layout estilo Zillow */}
      <div className="mx-auto px-4 pt-4 max-w-[1800px]">
        {properties.length === 0 ? (
          <Alert className="max-w-2xl mx-auto mt-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No se encontraron propiedades que coincidan con tu búsqueda.
              <br />
              Intenta ajustar los filtros para ver más resultados.
            </AlertDescription>
          </Alert>
        ) : (
          <PropertiesMapView initialProperties={properties} total={total} />
        )}
      </div>
    </div>
  );
}
