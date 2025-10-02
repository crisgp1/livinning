// ============================================
// LIVINNING - Página de Detalle de Propiedad
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Eye,
  Calendar,
  Building2,
  Mail,
  Phone,
  Share2,
  Flag,
  Loader2,
  Home,
} from 'lucide-react';
import { FavoriteButton } from '@/components/properties/favorite-button';
import { ReportDialog } from '@/components/reports/report-dialog';
import { Property } from '@/types';

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setPropertyId(id);
      fetchProperty(id);
    });
  }, [params]);

  const fetchProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`);

      if (!response.ok) {
        setProperty(null);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setProperty(data.data.property);
      } else {
        setProperty(null);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full card-airbnb border-0 shadow-xl">
          <CardContent className="pt-12 pb-10 px-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Fluent Emoji 3D - Sad Face */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-violet/20 to-purple-vibrant/20 rounded-full blur-2xl animate-pulse" />
                <img
                  src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Disappointed%20face/3D/disappointed_face_3d.png"
                  alt="No encontrado"
                  className="w-32 h-32 object-contain relative z-10"
                  loading="eager"
                />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  Propiedad no encontrada
                </h1>
                <p className="text-lg text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  La propiedad que buscas no existe o ya no está disponible
                </p>
              </div>

              <div className="w-full pt-4 space-y-3">
                <Button
                  onClick={() => router.push('/propiedades')}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Explorar propiedades
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const propertyTypeLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Departamento',
    land: 'Terreno',
    commercial: 'Local Comercial',
    office: 'Oficina',
  };

  const transactionTypeLabel =
    property.transactionType === 'rent' ? 'Renta' : 'Venta';
  const priceLabel =
    property.transactionType === 'rent'
      ? `${property.currency} ${property.price.toLocaleString()}/mes`
      : `${property.currency} ${property.price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Gallery Section */}
      <section className="bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-6xl mx-auto">
            {property.images.length > 0 ? (
              <>
                <div className="md:row-span-2">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {property.images.slice(1, 5).map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`${property.title} - Imagen ${index + 2}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="md:col-span-2 bg-neutral-700 rounded-lg flex items-center justify-center h-96">
                <p className="text-neutral-400">Sin imágenes disponibles</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {propertyTypeLabels[property.propertyType] || property.propertyType}
                </Badge>
                <Badge
                  variant={property.transactionType === 'rent' ? 'default' : 'outline'}
                >
                  {transactionTypeLabel}
                </Badge>
                {property.status === 'active' && (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Disponible
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                {property.title}
              </h1>

              <div className="flex items-center gap-4 text-neutral-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.address}, {property.city}, {property.state}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{property.views.toLocaleString()} vistas</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-4xl font-bold text-primary">{priceLabel}</p>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-500">Recámaras</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-500">Baños</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-700">
                  <Maximize className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-neutral-500">Área</p>
                    <p className="font-semibold">{property.area} m²</p>
                  </div>
                </div>
                {property.parkingSpaces && property.parkingSpaces > 0 && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-neutral-500">Estacionamiento</p>
                      <p className="font-semibold">{property.parkingSpaces}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Descripción
              </h2>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {property.description || 'Sin descripción disponible.'}
              </p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    Amenidades
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-neutral-700"
                      >
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Ubicación
              </h2>
              <div className="bg-neutral-200 rounded-lg h-64 flex items-center justify-center">
                <p className="text-neutral-500">
                  Mapa disponible próximamente
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {property.ownerName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {property.ownerType === 'AGENCY' ? 'Agencia Inmobiliaria' : 'Propietario'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <FavoriteButton propertyId={property.id} />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar propiedad
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Publicado:{' '}
                      {new Date(property.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {property.updatedAt && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Actualizado:{' '}
                        {new Date(property.updatedAt).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        type="property"
        propertyId={propertyId}
        title={property.title}
      />
    </div>
  );
}
