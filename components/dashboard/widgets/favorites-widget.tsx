// ============================================
// LIVINNING - Favorites Widget (Modern)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MapPin, Eye, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  views: number;
}

interface FavoritesWidgetProps {
  title: string;
  favorites: FavoriteProperty[];
}

export function FavoritesWidget({ title, favorites }: FavoritesWidgetProps) {
  return (
    <Card className="card-airbnb overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-red via-pink-vibrant to-error-500 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-vibrant/20 to-transparent rounded-full blur-3xl" />

      <CardHeader className="flex flex-row items-center justify-between pb-4 relative">
        <CardTitle className="text-lg font-bold text-neutral-800 flex items-center gap-2">
          <Heart className="h-5 w-5 text-coral-red fill-coral-red" />
          {title}
        </CardTitle>
        {favorites.length > 0 && (
          <Link href="/dashboard/user/favoritos">
            <Button variant="ghost" size="sm" className="text-coral-red hover:text-pink-vibrant hover:bg-pink-vibrant/10 transition-all">
              Ver todos
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="relative">
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-coral-red to-pink-vibrant rounded-3xl animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-coral-red to-pink-vibrant rounded-3xl flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">
              Descubre tu hogar ideal
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Guarda tus propiedades favoritas para encontrarlas fácilmente
            </p>
            <Link href="/propiedades">
              <Button className="bg-gradient-to-r from-coral-red to-pink-vibrant hover:from-pink-vibrant hover:to-coral-red transition-all duration-300 shadow-lg hover:shadow-xl group">
                <Sparkles className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Explorar propiedades
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {favorites.map((property, index) => (
                <Link
                  key={property.id}
                  href={`/propiedades/${property.id}`}
                  className="group block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3 p-3 rounded-xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-100 hover:border-pink-vibrant/30 hover:shadow-md transition-all duration-300">
                    {/* Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2">
                        <div className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Heart className="h-4 w-4 text-coral-red fill-coral-red" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <div className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm flex items-center gap-1">
                          <Star className="h-3 w-3 text-gold-yellow fill-gold-yellow" />
                          <span className="text-xs font-bold">4.8</span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-neutral-800 line-clamp-1 group-hover:text-coral-red transition-colors">
                          {property.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-base font-bold bg-gradient-to-r from-coral-red to-pink-vibrant bg-clip-text text-transparent">
                            ${property.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-500 ml-1">/mes</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 text-xs text-neutral-600">
                          <Eye className="h-3 w-3" />
                          {property.views}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
