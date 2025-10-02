// ============================================
// LIVINNING - Property Table Component
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, MoreVertical, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PropertyTableProps {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

/**
 * Tabla de propiedades
 * Principio de Responsabilidad Única: Solo muestra y gestiona la tabla de propiedades
 */
export function PropertyTable({
  properties,
  currentPage,
  totalPages,
  baseUrl,
}: PropertyTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const propertyTypeLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Departamento',
    land: 'Terreno',
    commercial: 'Local Comercial',
    office: 'Oficina',
  };

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Activa', variant: 'default' },
    pending: { label: 'Pendiente', variant: 'secondary' },
    rejected: { label: 'Rechazada', variant: 'destructive' },
    sold: { label: 'Vendida', variant: 'outline' },
    rented: { label: 'Rentada', variant: 'outline' },
  };

  const handleDelete = async (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/properties/${propertyToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Propiedad eliminada exitosamente');
        // Recargar la página para actualizar la lista
        window.location.reload();
      } else {
        toast.error(data.error?.message || 'Error al eliminar propiedad');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error al eliminar propiedad');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Vistas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                {/* Imagen */}
                <TableCell>
                  <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                    {property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Título */}
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={property.title}>
                    {property.title}
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  <Badge variant="outline">
                    {propertyTypeLabels[property.propertyType] || property.propertyType}
                  </Badge>
                </TableCell>

                {/* Precio */}
                <TableCell>
                  <div className="font-semibold">
                    {property.currency || '$'} {(property.price || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {property.transactionType === 'rent' ? '/mes' : ''}
                  </div>
                </TableCell>

                {/* Ubicación */}
                <TableCell>
                  <div className="text-sm">
                    {property.city || 'Sin ciudad'}, {property.state || 'Sin estado'}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge variant={statusLabels[property.status]?.variant || 'secondary'}>
                    {statusLabels[property.status]?.label || property.status}
                  </Badge>
                </TableCell>

                {/* Vistas */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">{(property.views || 0).toLocaleString()}</span>
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/propiedades/${property.id}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver en sitio público
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`${baseUrl}/${property.id}/editar`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link href={`${baseUrl}?page=${currentPage - 1}`}>
              <Button variant="outline">Anterior</Button>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Link key={pageNum} href={`${baseUrl}?page=${pageNum}`}>
                  <Button
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Link href={`${baseUrl}?page=${currentPage + 1}`}>
              <Button variant="outline">Siguiente</Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La propiedad será eliminada permanentemente
              de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
