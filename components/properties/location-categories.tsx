// ============================================
// LIVINNING - Location Categories Component
// ============================================

'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { LocationType } from '@/types';

interface LocationCategory {
  id: LocationType;
  name: string;
  emoji: string;
  color: string;
}

const categories: LocationCategory[] = [
  {
    id: 'city',
    name: 'Ciudad',
    emoji: '🏙️',
    color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  },
  {
    id: 'beach',
    name: 'Playa',
    emoji: '🏖️',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200',
  },
  {
    id: 'mountain',
    name: 'Montaña',
    emoji: '⛰️',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
  },
  {
    id: 'countryside',
    name: 'Campo',
    emoji: '🌾',
    color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  },
  {
    id: 'lake',
    name: 'Lago',
    emoji: '🏞️',
    color: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200',
  },
  {
    id: 'suburb',
    name: 'Suburbio',
    emoji: '🏘️',
    color: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200',
  },
];

/**
 * Componente de categorías de ubicación
 * Principio de Responsabilidad Única: Solo maneja filtros por tipo de ubicación
 */
export function LocationCategories() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('locationType') as LocationType | null;

  const handleCategoryClick = (categoryId: LocationType) => {
    const params = new URLSearchParams(searchParams.toString());

    // Si se hace clic en la categoría activa, se deselecciona
    if (activeCategory === categoryId) {
      params.delete('locationType');
    } else {
      params.set('locationType', categoryId);
    }

    // Reset a página 1
    params.delete('page');

    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div className="bg-white border-b border-neutral-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">
            Explora por categoría:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category, index) => {
              const isActive = activeCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative inline-flex items-center gap-1.5 px-3 py-1.5
                    rounded-full border text-sm font-medium
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary ring-offset-1'
                        : category.color
                    }
                  `}
                >
                  <motion.span
                    className="text-base leading-none"
                    whileHover={{ rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.emoji}
                  </motion.span>
                  <span className="leading-none">{category.name}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeChip"
                      className="absolute inset-0 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
