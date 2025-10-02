// ============================================
// LIVINNING - Página de Mis Propiedades
// ============================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { listProperties } from '@/lib/db/models/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PropertyTable } from '@/components/properties/property-table';
import { Plus, Info } from 'lucide-react';
import Link from 'next/link';

interface PropertiesPageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

/**
 * Página de Mis Propiedades
 * Principio de Responsabilidad Única: Solo muestra las propiedades del usuario autenticado
 */
export default async function PropertiesPage({ params, searchParams }: PropertiesPageProps) {
  // Autenticación
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/');
  }

  // Obtener parámetros
  const { role } = await params;
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam) : 1;
  const limit = 10;

  // Obtener metadata del usuario
  const userRole = ((user.publicMetadata?.role as string)?.toUpperCase()) || 'USER';
  const propertyLimit = (user.publicMetadata?.propertyLimit as number) || 1;
  const subscriptionStatus = (user.publicMetadata?.subscriptionStatus as string) || 'inactive';

  // Determinar si es rol administrativo
  const isAdmin = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'HELPDESK';

  // Obtener propiedades
  // Si es admin, muestra todas las propiedades. Si no, solo las del usuario.
  const { properties, total } = await listProperties({
    ...(isAdmin ? {} : { ownerId: userId }),
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const totalPages = Math.ceil(total / limit);

  // Determinar si puede publicar más propiedades
  const canPublish = userRole === 'USER'
    ? total < propertyLimit
    : userRole === 'AGENCY'
    ? subscriptionStatus === 'active'
    : false;

  const getPublishMessage = () => {
    if (userRole === 'USER') {
      if (canPublish) {
        return `Puedes publicar ${propertyLimit - total} propiedad(es) más.`;
      }
      return `Has alcanzado el límite de ${propertyLimit} propiedad(es). Actualiza tu plan para publicar más.`;
    }
    if (userRole === 'AGENCY') {
      if (subscriptionStatus === 'active') {
        return 'Como agencia, puedes publicar propiedades ilimitadas.';
      }
      return 'Tu suscripción no está activa. Reactívala para publicar propiedades.';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Mis Propiedades
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestiona tus propiedades publicadas
          </p>
        </div>

        <Link href={`/dashboard/${role}/propiedades/nueva`}>
          <Button disabled={!canPublish}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-bright/30 bg-blue-bright/5">
        <Info className="h-4 w-4 text-blue-bright" />
        <AlertDescription className="text-neutral-700">
          Tienes <strong>{total}</strong> propiedad(es) publicada(s).{' '}
          {getPublishMessage()}
        </AlertDescription>
      </Alert>

      {/* Properties Table */}
      {properties.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay propiedades</CardTitle>
            <CardDescription>
              Aún no has publicado ninguna propiedad. Comienza publicando tu primera propiedad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/${role}/propiedades/nueva`}>
              <Button disabled={!canPublish}>
                <Plus className="h-4 w-4 mr-2" />
                Publicar mi primera propiedad
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {total} Propiedad{total !== 1 ? 'es' : ''}
            </CardTitle>
            <CardDescription>
              Mostrando página {page} de {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyTable
              properties={properties}
              currentPage={page}
              totalPages={totalPages}
              baseUrl={`/dashboard/${role}/propiedades`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
