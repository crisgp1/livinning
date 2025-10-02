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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <Select
                  value={transactionType || 'all'}
                  onValueChange={setTransactionType}
                >
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
                <Select
                  value={propertyType || 'all'}
                  onValueChange={setPropertyType}
                >
                  <SelectTrigger className="border-neutral-200">
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
              </div>

              <div className="md:col-span-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
