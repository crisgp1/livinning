// ============================================
// LIVINNING - Property Filters Component
// ============================================

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PropertyFiltersProps {
  initialCity?: string;
  initialPropertyType?: string;
  initialTransactionType?: string;
}

/**
 * Componente de filtros de búsqueda de propiedades
 * Principio de Responsabilidad Única: Solo maneja filtros de búsqueda
 */
export function PropertyFilters({
  initialCity = '',
  initialPropertyType = '',
  initialTransactionType = '',
}: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(initialCity);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [transactionType, setTransactionType] = useState(initialTransactionType);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Actualizar o eliminar parámetros según los valores
    if (city) {
      params.set('city', city);
    } else {
      params.delete('city');
    }

    if (propertyType && propertyType !== 'all') {
      params.set('propertyType', propertyType);
    } else {
      params.delete('propertyType');
    }

    if (transactionType && transactionType !== 'all') {
      params.set('transactionType', transactionType);
    } else {
      params.delete('transactionType');
    }

    // Reset a página 1 al hacer nueva búsqueda
    params.delete('page');

    // Navegar con los nuevos parámetros
    router.push(`/propiedades?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Búsqueda por Ciudad */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Ciudad, colonia o código postal..."
                className="pl-9 h-10"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Tipo de Operación */}
          <Select
            value={transactionType || 'all'}
            onValueChange={setTransactionType}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sale">Venta</SelectItem>
              <SelectItem value="rent">Renta</SelectItem>
            </SelectContent>
          </Select>

          {/* Tipo de Propiedad */}
          <Select
            value={propertyType || 'all'}
            onValueChange={setPropertyType}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="apartment">Departamento</SelectItem>
              <SelectItem value="land">Terreno</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
              <SelectItem value="office">Oficina</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Buscar */}
          <Button
            className="bg-primary hover:bg-primary/90 h-10 px-6"
            onClick={handleSearch}
          >
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
}
