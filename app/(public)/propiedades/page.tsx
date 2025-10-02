// ============================================
// LIVINNING - Página Pública de Propiedades
// ============================================

import { PropertyCard } from '@/components/properties/property-card';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyMap } from '@/components/properties/property-map';
import { listProperties } from '@/lib/db/models/property';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Grid3x3, Map } from 'lucide-react';

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
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 12;

  // Obtener propiedades de la base de datos
  const { properties, total } = await listProperties({
    status: 'active',
    city: params.city,
    propertyType: params.propertyType,
    transactionType: params.transactionType as 'sale' | 'rent' | undefined,
    page,
    limit,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: 'desc',
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section con Búsqueda */}
      <PropertyFilters
        initialCity={params.city}
        initialPropertyType={params.propertyType}
        initialTransactionType={params.transactionType}
      />

      {/* Resultados */}
      <section className="container mx-auto px-4 py-12">
        {properties.length === 0 ? (
          <Alert className="max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No se encontraron propiedades que coincidan con tu búsqueda.
              <br />
              Intenta ajustar los filtros para ver más resultados.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {total} Propiedad{total !== 1 ? 'es' : ''} Disponible{total !== 1 ? 's' : ''}
              </h2>
              <p className="text-neutral-600 text-sm mt-1">
                Mostrando página {page} de {totalPages}
              </p>
            </div>

            {/* Tabs: Grid / Mapa */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  Vista Grid
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <Map className="h-4 w-4" />
                  Vista Mapa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-6">
                {/* Grid de Propiedades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
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

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {page > 1 && (
                      <a
                        href={`/propiedades?page=${page - 1}${params.city ? `&city=${params.city}` : ''}${params.propertyType ? `&propertyType=${params.propertyType}` : ''}${params.transactionType ? `&transactionType=${params.transactionType}` : ''}`}
                        className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Anterior
                      </a>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <a
                          key={pageNum}
                          href={`/propiedades?page=${pageNum}${params.city ? `&city=${params.city}` : ''}${params.propertyType ? `&propertyType=${params.propertyType}` : ''}${params.transactionType ? `&transactionType=${params.transactionType}` : ''}`}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            pageNum === page
                              ? 'bg-primary text-white'
                              : 'border border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          {pageNum}
                        </a>
                      );
                    })}

                    {page < totalPages && (
                      <a
                        href={`/propiedades?page=${page + 1}${params.city ? `&city=${params.city}` : ''}${params.propertyType ? `&propertyType=${params.propertyType}` : ''}${params.transactionType ? `&transactionType=${params.transactionType}` : ''}`}
                        className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Siguiente
                      </a>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map">
                <PropertyMap properties={properties} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </section>
    </div>
  );
}
