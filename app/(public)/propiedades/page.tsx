// ============================================
// LIVINNING - Página Pública de Propiedades
// ============================================

import { PropertyCard } from '@/components/properties/property-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';

// TODO: Reemplazar con datos reales de la base de datos
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Hermoso departamento en el centro con vista panorámica',
    price: 25000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
    address: 'Av. Reforma 123',
    city: 'Polanco',
    state: 'CDMX',
    propertyType: 'apartment',
    transactionType: 'rent' as const,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    parkingSpaces: 2,
    views: 521,
    ownerName: 'Inmobiliaria Premium',
    ownerType: 'AGENCY' as const,
    isVerified: true,
  },
  {
    id: '2',
    title: 'Casa moderna con jardín y alberca privada',
    price: 4500000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'],
    address: 'Calle Privada 45',
    city: 'Guadalajara',
    state: 'Jalisco',
    propertyType: 'house',
    transactionType: 'sale' as const,
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    parkingSpaces: 3,
    views: 342,
    ownerName: 'Juan Pérez',
    ownerType: 'USER' as const,
    isVerified: false,
  },
  {
    id: '3',
    title: 'Loft industrial en zona histórica completamente renovado',
    price: 18000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
    address: 'Centro Histórico',
    city: 'Guadalajara',
    state: 'Jalisco',
    propertyType: 'apartment',
    transactionType: 'rent' as const,
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    parkingSpaces: 1,
    views: 289,
    ownerName: 'María González',
    ownerType: 'USER' as const,
    isVerified: false,
  },
  {
    id: '4',
    title: 'Casa moderna con vista al mar, diseño contemporáneo',
    price: 15000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'],
    address: 'Zona Hotelera',
    city: 'Playa del Carmen',
    state: 'Quintana Roo',
    propertyType: 'house',
    transactionType: 'rent' as const,
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    parkingSpaces: 2,
    views: 642,
    ownerName: 'Riviera Properties',
    ownerType: 'AGENCY' as const,
    isVerified: true,
  },
  {
    id: '5',
    title: 'Penthouse de lujo con terraza privada',
    price: 8500000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'],
    address: 'Av. Constituyentes 200',
    city: 'Santa Fe',
    state: 'CDMX',
    propertyType: 'apartment',
    transactionType: 'sale' as const,
    bedrooms: 3,
    bathrooms: 3,
    area: 200,
    parkingSpaces: 3,
    views: 892,
    ownerName: 'Luxury Homes MX',
    ownerType: 'AGENCY' as const,
    isVerified: true,
  },
  {
    id: '6',
    title: 'Departamento céntrico amueblado listo para habitar',
    price: 12000,
    currency: '$',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
    address: 'Av. Chapultepec 89',
    city: 'Roma Norte',
    state: 'CDMX',
    propertyType: 'apartment',
    transactionType: 'rent' as const,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    parkingSpaces: 1,
    views: 456,
    ownerName: 'Carlos Ramírez',
    ownerType: 'USER' as const,
    isVerified: false,
  },
];

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section con Búsqueda */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5 border-b border-neutral-200">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
                Encuentra tu Hogar Ideal
              </h1>
              <p className="text-lg text-neutral-600">
                Miles de propiedades en venta y renta en todo México
              </p>
            </div>

            {/* Barra de Búsqueda */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      placeholder="Buscar por ciudad, colonia o código postal..."
                      className="pl-10 border-neutral-200"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <Select>
                    <SelectTrigger className="border-neutral-200">
                      <SelectValue placeholder="Tipo de operación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="sale">Venta</SelectItem>
                      <SelectItem value="rent">Renta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Select>
                    <SelectTrigger className="border-neutral-200">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="apartment">Departamento</SelectItem>
                      <SelectItem value="land">Terreno</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros Rápidos */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-full">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Rango de Precio
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Habitaciones
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Baños
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {MOCK_PROPERTIES.length} Propiedades Disponibles
            </h2>
            <p className="text-neutral-600 text-sm mt-1">
              Mostrando resultados en todo México
            </p>
          </div>

          <Select defaultValue="recent">
            <SelectTrigger className="w-48 border-neutral-200">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
              <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de Propiedades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROPERTIES.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Paginación (placeholder) */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button variant="outline" disabled>
            Anterior
          </Button>
          <Button variant="default">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">
            Siguiente
          </Button>
        </div>
      </section>
    </div>
  );
}
