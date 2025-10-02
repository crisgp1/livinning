// ============================================
// LIVINNING - Editar Propiedad
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Home, MapPin, DollarSign, Upload, X, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Property } from '@/types';
import { PropertyFieldViolation } from '@/types/database';
import { FieldViolationAlert } from '@/components/properties/field-violation-alert';

const PROPERTY_FIELDS = [
  { value: 'title', label: 'Título' },
  { value: 'description', label: 'Descripción' },
  { value: 'price', label: 'Precio' },
  { value: 'address', label: 'Dirección' },
  { value: 'city', label: 'Ciudad' },
  { value: 'state', label: 'Estado' },
  { value: 'zipCode', label: 'Código Postal' },
  { value: 'images', label: 'Imágenes' },
  { value: 'propertyType', label: 'Tipo de Propiedad' },
  { value: 'transactionType', label: 'Tipo de Transacción' },
  { value: 'locationType', label: 'Tipo de Ubicación' },
  { value: 'bedrooms', label: 'Recámaras' },
  { value: 'bathrooms', label: 'Baños' },
  { value: 'area', label: 'Área' },
  { value: 'parkingSpaces', label: 'Espacios de Estacionamiento' },
  { value: 'other', label: 'Otro' },
];

/**
 * Página de edición de propiedad
 * Principio de Responsabilidad Única: Solo maneja la edición de una propiedad existente
 */
export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [fieldViolations, setFieldViolations] = useState<PropertyFieldViolation[]>([]);
  const [moderationNotes, setModerationNotes] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: '',
    transactionType: '',
    locationType: '',
    price: '',
    state: '',
    city: '',
    neighborhood: '',
    address: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    landArea: '',
    parkingSpaces: '',
  });

  const propertyId = params.id as string;
  const userRole = ((clerkUser?.publicMetadata?.role as string) || 'user').toLowerCase();

  // Cargar datos de la propiedad
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`/api/properties/${propertyId}`);
        const data = await response.json();

        if (data.success && data.data.property) {
          const prop = data.data.property as Property;
          setProperty(prop);

          // Llenar el formulario con los datos existentes
          setFormData({
            title: prop.title || '',
            description: prop.description || '',
            propertyType: prop.propertyType || '',
            transactionType: prop.transactionType || '',
            locationType: prop.locationType || '',
            price: prop.price?.toString() || '',
            state: prop.state || '',
            city: prop.city || '',
            neighborhood: '', // No tenemos este campo en el modelo
            address: prop.address || '',
            zipCode: prop.zipCode || '',
            bedrooms: prop.bedrooms?.toString() || '',
            bathrooms: prop.bathrooms?.toString() || '',
            area: prop.area?.toString() || '',
            landArea: '',
            parkingSpaces: prop.parkingSpaces?.toString() || '',
          });

          setImages(prop.images || []);

          // Cargar violaciones y notas de moderación si existen
          if (prop.fieldViolations) {
            setFieldViolations(prop.fieldViolations);
          }
          if (prop.moderationNotes) {
            setModerationNotes(prop.moderationNotes);
          }
        } else {
          toast.error('No se pudo cargar la propiedad');
          router.push(`/dashboard/${userRole}/propiedades`);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Error al cargar la propiedad');
        router.push(`/dashboard/${userRole}/propiedades`);
      } finally {
        setIsFetching(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, userRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          propertyType: formData.propertyType,
          transactionType: formData.transactionType,
          locationType: formData.locationType || undefined,
          price: parseFloat(formData.price),
          state: formData.state,
          city: formData.city,
          address: formData.address,
          zipCode: formData.zipCode,
          country: 'México',
          currency: 'MXN',
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          area: parseFloat(formData.area),
          parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : undefined,
          images,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Propiedad actualizada exitosamente');
        router.push(`/dashboard/${userRole}/propiedades`);
      } else {
        toast.error(data.error?.message || 'Error al actualizar propiedad');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Error al actualizar propiedad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simular URLs de imágenes (en producción usar Cloudinary/S3)
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-neutral-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/${userRole}/propiedades`}
          className="hover:bg-neutral-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-800">Editar propiedad</h1>
          <p className="text-neutral-500">Actualiza la información de tu propiedad</p>
        </div>
      </div>

      {/* Moderation Alerts */}
      {property?.moderationStatus === 'needs_correction' && fieldViolations.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-900">
            Correcciones Requeridas por Moderación
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-yellow-800">
              Un administrador ha solicitado correcciones en tu propiedad antes de publicarla.
              Los campos con problemas están marcados en rojo a continuación.
            </p>
            {moderationNotes && (
              <>
                <Separator className="bg-yellow-200" />
                <div>
                  <p className="font-medium text-yellow-900">Notas del administrador:</p>
                  <p className="text-yellow-800 mt-1">{moderationNotes}</p>
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {fieldViolations.map((violation, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={
                    violation.severity === 'high'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : violation.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  }
                >
                  {PROPERTY_FIELDS.find((f) => f.value === violation.field)?.label ||
                    violation.field}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card className="card-airbnb">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-800">
              <Home className="h-5 w-5 text-primary-500" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la propiedad *</Label>
              <Input
                id="title"
                placeholder="Ej: Hermoso departamento en el centro"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-neutral-200 focus:border-primary-500"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500">Mínimo 20 caracteres, máximo 100</p>
              <FieldViolationAlert violations={fieldViolations} fieldName="title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu propiedad en detalle: características, ubicación, servicios cercanos..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="border-neutral-200 focus:border-primary-500 resize-none"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500">Mínimo 100 caracteres</p>
              <FieldViolationAlert violations={fieldViolations} fieldName="description" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de propiedad *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-neutral-200">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Departamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                    <SelectItem value="commercial">Local Comercial</SelectItem>
                    <SelectItem value="office">Oficina</SelectItem>
                  </SelectContent>
                </Select>
                <FieldViolationAlert violations={fieldViolations} fieldName="propertyType" />
              </div>

              <div className="space-y-2">
                <Label>Operación *</Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-neutral-200">
                    <SelectValue placeholder="Selecciona una operación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Renta</SelectItem>
                    <SelectItem value="sale">Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Tipo de ubicación</Label>
                <Select
                  value={formData.locationType}
                  onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-neutral-200">
                    <SelectValue placeholder="Selecciona el tipo de ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">Ciudad - Propiedades en zonas urbanas</SelectItem>
                    <SelectItem value="beach">Playa - Propiedades frente al mar</SelectItem>
                    <SelectItem value="mountain">Montaña - Propiedades en zonas montañosas</SelectItem>
                    <SelectItem value="countryside">Campo - Propiedades rurales</SelectItem>
                    <SelectItem value="lake">Lago - Propiedades junto a lagos</SelectItem>
                    <SelectItem value="suburb">Suburbio - Propiedades en zonas residenciales</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  Esto ayudará a los usuarios a encontrar tu propiedad según el tipo de ubicación que buscan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card className="card-airbnb">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-800">
              <MapPin className="h-5 w-5 text-primary-500" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Input
                  placeholder="Ej: Jalisco"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="border-neutral-200"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Ciudad *</Label>
                <Input
                  placeholder="Ej: Guadalajara"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-neutral-200"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Código Postal *</Label>
                <Input
                  placeholder="44630"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="border-neutral-200"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Dirección completa *</Label>
                <Input
                  placeholder="Calle, número"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="border-neutral-200"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precio y Detalles */}
        <Card className="card-airbnb">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-800">
              <DollarSign className="h-5 w-5 text-primary-500" />
              Precio y detalles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Precio *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-neutral-500">$</span>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="pl-7 border-neutral-200"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Habitaciones</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="border-neutral-200"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Baños</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="border-neutral-200"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>m² construidos *</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="border-neutral-200"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Estacionamientos</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.parkingSpaces}
                  onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                  className="border-neutral-200"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card className="card-airbnb">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-800">
              <Upload className="h-5 w-5 text-primary-500" />
              Imágenes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-700 font-medium mb-1">Arrastra imágenes aquí</p>
              <p className="text-sm text-neutral-500 mb-4">
                o haz clic para seleccionar archivos
              </p>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                className="border-neutral-200"
                onClick={() => document.getElementById('images')?.click()}
                disabled={isLoading}
              >
                Seleccionar imágenes
              </Button>
              <p className="text-xs text-neutral-400 mt-4">
                PNG, JPG hasta 5MB. Mínimo 3 imágenes, máximo 20.
              </p>
            </div>

            {/* Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-neutral-100"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 text-neutral-600" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium shadow-md">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
          <Link href={`/dashboard/${userRole}/propiedades`}>
            <Button type="button" variant="ghost" className="text-neutral-600" disabled={isLoading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="btn-primary gap-2" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Actualizando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
