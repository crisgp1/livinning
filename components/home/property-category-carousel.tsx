// ============================================
// LIVINNING - Property Category Carousel (Fluent Emojis)
// ============================================

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface PropertyCategory {
  id: string;
  name: string;
  emojiFolder: string; // Fluent Emoji folder name
  emojiFile: string; // Fluent Emoji file name
  color: string; // Gradient class
}

const categories: PropertyCategory[] = [
  {
    id: 'city',
    name: 'Ciudad',
    emojiFolder: 'Cityscape',
    emojiFile: 'cityscape_3d.png',
    color: 'from-blue-bright to-blue-violet',
  },
  {
    id: 'beach',
    name: 'Playa',
    emojiFolder: 'Beach with umbrella',
    emojiFile: 'beach_with_umbrella_3d.png',
    color: 'from-blue-violet to-purple-vibrant',
  },
  {
    id: 'mountain',
    name: 'Montaña',
    emojiFolder: 'Mountain',
    emojiFile: 'mountain_3d.png',
    color: 'from-purple-vibrant to-pink-vibrant',
  },
  {
    id: 'countryside',
    name: 'Campo',
    emojiFolder: 'Ear of corn',
    emojiFile: 'ear_of_corn_3d.png',
    color: 'from-gold-yellow to-coral-red',
  },
  {
    id: 'lake',
    name: 'Lago',
    emojiFolder: 'National park',
    emojiFile: 'national_park_3d.png',
    color: 'from-blue-bright to-blue-violet',
  },
  {
    id: 'forest',
    name: 'Bosque',
    emojiFolder: 'Evergreen tree',
    emojiFile: 'evergreen_tree_3d.png',
    color: 'from-blue-violet to-purple-vibrant',
  },
  {
    id: 'historic',
    name: 'Histórico',
    emojiFolder: 'Castle',
    emojiFile: 'castle_3d.png',
    color: 'from-purple-vibrant to-pink-vibrant',
  },
  {
    id: 'modern',
    name: 'Moderno',
    emojiFolder: 'Office building',
    emojiFile: 'office_building_3d.png',
    color: 'from-blue-bright to-blue-violet',
  },
  {
    id: 'bank-foreclosure',
    name: 'Remates Bancarios',
    emojiFolder: 'Bank',
    emojiFile: 'bank_3d.png',
    color: 'from-coral-red to-pink-vibrant',
  },
  {
    id: 'large-estate',
    name: 'Latifundios',
    emojiFolder: 'Tractor',
    emojiFile: 'tractor_3d.png',
    color: 'from-gold-yellow to-blue-bright',
  },
  {
    id: 'major-works',
    name: 'Grandes Obras',
    emojiFolder: 'Building construction',
    emojiFile: 'building_construction_3d.png',
    color: 'from-purple-vibrant to-blue-violet',
  },
];

export function PropertyCategoryCarousel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
        dragFree: true,
      }}
      className="w-full relative"
    >
      <CarouselContent className="-ml-3 md:-ml-4">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const fluentEmojiUrl = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${category.emojiFolder}/3D/${category.emojiFile}`;

          return (
            <CarouselItem key={category.id} className="pl-3 md:pl-4 basis-auto">
              <button
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={cn(
                  'flex flex-col items-center gap-4 p-6 transition-all duration-300 min-w-[140px]',
                  'hover:scale-105 active:scale-95',
                  isSelected && 'bg-gradient-to-br scale-105',
                  isSelected && category.color
                )}
              >
                {/* Fluent Emoji */}
                <img
                  src={fluentEmojiUrl}
                  alt={category.name}
                  className={cn(
                    'w-20 h-20 object-contain transition-transform duration-300',
                    isSelected && 'scale-110'
                  )}
                  loading="lazy"
                />

                {/* Category Name */}
                <span className="text-base font-semibold text-neutral-700">
                  {category.name}
                </span>
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Previous Button - Airbnb Style */}
      <CarouselPrevious
        className={cn(
          'left-4 h-10 w-10 rounded-full bg-white border-2 border-neutral-200',
          'shadow-md hover:shadow-lg hover:scale-105',
          'transition-all duration-200',
          'hidden md:flex',
          'disabled:opacity-0 disabled:pointer-events-none'
        )}
      />

      {/* Next Button - Airbnb Style */}
      <CarouselNext
        className={cn(
          'right-4 h-10 w-10 rounded-full bg-white border-2 border-neutral-200',
          'shadow-md hover:shadow-lg hover:scale-105',
          'transition-all duration-200',
          'hidden md:flex',
          'disabled:opacity-0 disabled:pointer-events-none'
        )}
      />
    </Carousel>
  );
}
