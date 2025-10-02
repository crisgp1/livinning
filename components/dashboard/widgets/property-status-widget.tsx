// ============================================
// LIVINNING - Property Status Widget (Modern)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Plus, AlertCircle, CheckCircle2, Eye, Heart, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyStatusWidgetProps {
  title: string;
  description?: string;
  hasProperty: boolean;
  propertyData?: {
    id: string;
    title: string;
    status: 'active' | 'pending' | 'rejected';
    views: number;
    likes: number;
  };
}

export function PropertyStatusWidget({
  title,
  description,
  hasProperty,
  propertyData,
}: PropertyStatusWidgetProps) {
  return (
    <Card className="card-airbnb overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-bright via-blue-violet to-purple-vibrant opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-bright/20 to-transparent rounded-full blur-3xl" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-bright" />
              {title}
            </CardTitle>
            {description && <p className="text-sm text-neutral-500">{description}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {!hasProperty ? (
          <div className="text-center py-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-bright to-blue-violet rounded-3xl animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-bright to-blue-violet rounded-3xl flex items-center justify-center">
                <Home className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">
              ¡Comienza ahora!
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Publica tu primera propiedad <strong className="text-blue-bright">gratis</strong>
            </p>
            <Link href="/dashboard/user/propiedades/nueva">
              <Button className="bg-gradient-to-r from-blue-bright to-blue-violet hover:from-blue-violet hover:to-purple-vibrant transition-all duration-300 shadow-lg hover:shadow-xl group">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                Publicar Propiedad
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-blue-bright/5 border border-neutral-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-neutral-800 line-clamp-2 flex-1">
                    {propertyData?.title}
                  </h3>
                  <Badge
                    className={cn(
                      'font-medium ml-2 shadow-sm',
                      propertyData?.status === 'active' &&
                        'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white border-0',
                      propertyData?.status === 'pending' &&
                        'bg-gradient-to-r from-warning-500 to-gold-yellow hover:from-gold-yellow hover:to-warning-500 text-white border-0',
                      propertyData?.status === 'rejected' &&
                        'bg-gradient-to-r from-error-500 to-coral-red hover:from-coral-red hover:to-error-500 text-white border-0'
                    )}
                  >
                    {propertyData?.status === 'active' && (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Activa
                      </>
                    )}
                    {propertyData?.status === 'pending' && (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3 animate-pulse" />
                        Pendiente
                      </>
                    )}
                    {propertyData?.status === 'rejected' && (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Rechazada
                      </>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-vibrant/20 to-blue-violet/20 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-purple-vibrant" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Vistas</p>
                      <p className="font-bold text-neutral-800">{propertyData?.views || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-red/20 to-pink-vibrant/20 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-coral-red" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Me gusta</p>
                      <p className="font-bold text-neutral-800">{propertyData?.likes || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/user/propiedades/${propertyData?.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full hover:bg-blue-bright/5 hover:text-blue-bright hover:border-blue-bright transition-all">
                    Ver detalles
                  </Button>
                </Link>
                <Link href={`/dashboard/user/propiedades/${propertyData?.id}/editar`} className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-to-r from-blue-bright to-blue-violet hover:from-blue-violet hover:to-purple-vibrant transition-all">
                    Editar
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-vibrant" />
                      Rendimiento de vistas
                    </span>
                    <span className="text-sm font-bold text-purple-vibrant">{propertyData?.views || 0}</span>
                  </div>
                  <Progress value={Math.min((propertyData?.views || 0) / 5, 100)} className="h-2" />
                  <p className="text-xs text-neutral-500 mt-1">
                    {propertyData?.views ? '¡Muy bien!' : 'Comparte tu propiedad para más vistas'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-coral-red" />
                      Engagement
                    </span>
                    <span className="text-sm font-bold text-coral-red">{propertyData?.likes || 0}</span>
                  </div>
                  <Progress
                    value={Math.min((propertyData?.likes || 0) / 3, 100)}
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-coral-red [&>div]:to-pink-vibrant"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {propertyData?.likes ? 'Excelente interés' : 'Agrega mejores fotos para más likes'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
