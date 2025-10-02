// ============================================
// LIVINNING - Landing Page (Home)
// ============================================

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Search,
  TrendingUp,
  Shield,
  Users,
  Star,
  Home,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  BarChart3
} from 'lucide-react';
import { PropertyCategoryCarousel } from '@/components/home/property-category-carousel';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50/50 to-background py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-800">
              Encuentra tu{' '}
              <span className="text-primary-500 relative">
                hogar ideal
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C50 2.5 150 2.5 199 5.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary-500"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              La plataforma de bienes raíces más completa de México. Miles de propiedades, agencias
              verificadas y la mejor experiencia de búsqueda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/propiedades">
                <Button size="lg" className="btn-primary h-14 px-8 text-base">
                  <Search className="mr-2 h-5 w-5" />
                  Explorar Propiedades
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories Carousel */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Explora por categoría
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Encuentra propiedades según el tipo de ubicación que buscas
            </p>
          </div>

          <PropertyCategoryCarousel />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              ¿Por qué elegir Livinning?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              La plataforma que conecta compradores, vendedores y agencias de forma segura y eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-airbnb border-0 shadow-md hover:shadow-hover transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-violet-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-8 w-8 text-blue-violet" />
                </div>
                <CardTitle className="text-xl font-bold text-neutral-800">Búsqueda Inteligente</CardTitle>
                <CardDescription className="text-neutral-600 mt-2">
                  Encuentra propiedades con filtros avanzados, recomendaciones personalizadas y búsqueda por ubicación en tiempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-airbnb border-0 shadow-md hover:shadow-hover transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gold-yellow-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-gold-yellow" />
                </div>
                <CardTitle className="text-xl font-bold text-neutral-800">Agencias Verificadas</CardTitle>
                <CardDescription className="text-neutral-600 mt-2">
                  Todas las agencias son verificadas y certificadas para garantizar tu seguridad y confianza en cada transacción
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-airbnb border-0 shadow-md hover:shadow-hover transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-coral-red-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-coral-red" />
                </div>
                <CardTitle className="text-xl font-bold text-neutral-800">Analíticas en Tiempo Real</CardTitle>
                <CardDescription className="text-neutral-600 mt-2">
                  Las agencias obtienen métricas detalladas, reportes de rendimiento y análisis de mercado actualizado
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* For Users */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-pink-vibrant-light text-pink-vibrant hover:bg-pink-vibrant-light border border-pink-vibrant/20">
                Para Usuarios
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">
                Publica tu propiedad{' '}
                <span className="text-primary-500">gratis</span>
              </h2>

              <p className="text-lg text-neutral-600 leading-relaxed">
                Como usuario individual, puedes publicar una propiedad completamente gratis. Sin costos
                ocultos, sin comisiones, sin sorpresas.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-800">1 propiedad gratis</div>
                    <div className="text-sm text-neutral-600">Publica sin costo alguno</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-800">Visibilidad garantizada</div>
                    <div className="text-sm text-neutral-600">Miles de personas verán tu propiedad</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-800">Guarda tus favoritos</div>
                    <div className="text-sm text-neutral-600">Organiza y compara propiedades</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-violet-light via-pink-vibrant-light to-purple-vibrant-light rounded-3xl p-8 md:p-12 shadow-lg">
                <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 gradient-pink-coral rounded-xl flex items-center justify-center shadow-md">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-800">Casa en Guadalajara</div>
                      <div className="text-sm text-neutral-500">Publicada hace 2 días</div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-blue-bright-light to-blue-violet-light rounded-xl flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-blue-bright" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-neutral-800">$2,500,000</div>
                    <Badge className="bg-gold-yellow text-neutral-900 hover:bg-gold-yellow shadow-sm">
                      Disponible
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies */}
      <section className="py-20 md:py-32 gradient-purple-blue text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white/90 text-sm font-medium">Dashboard de Agencia</div>
                    <Badge className="bg-gold-yellow text-neutral-900 hover:bg-gold-yellow shadow-md">Premium</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">142</div>
                      <div className="text-sm text-white/70">Propiedades</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">1.2K</div>
                      <div className="text-sm text-white/70">Visitas/mes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-white/70" />
                    <div className="text-sm text-white/70">Analíticas avanzadas disponibles</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <Badge className="bg-gold-yellow text-neutral-900 hover:bg-gold-yellow border border-gold-yellow/30 shadow-lg">
                Para Agencias
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold">
                Haz crecer tu negocio inmobiliario
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Acceso a propiedades ilimitadas, analíticas avanzadas y herramientas profesionales para
                impulsar tus ventas y destacar en el mercado.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Propiedades ilimitadas</div>
                    <div className="text-sm text-white/70">Publica sin límites</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Analíticas avanzadas</div>
                    <div className="text-sm text-white/70">Métricas y reportes detallados</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Soporte prioritario 24/7</div>
                    <div className="text-sm text-white/70">Asistencia cuando la necesites</div>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/pricing">
                  <Button size="lg" className="bg-white text-neutral-900 hover:bg-white/90 h-12 px-6">
                    Ver Planes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-neutral-600">
              Miles de personas confían en Livinning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-airbnb border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4">
                  "Encontré el departamento perfecto en menos de una semana. La plataforma es muy fácil de usar y las opciones de búsqueda son excelentes."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-violet-light rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-violet" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800">María González</div>
                    <div className="text-sm text-neutral-500">Usuario</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-airbnb border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gold-yellow fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4">
                  "Como agencia, las herramientas de analítica nos han ayudado a optimizar nuestras publicaciones y aumentar las ventas en un 40%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-vibrant-light rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-vibrant" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800">Inmobiliaria Premium</div>
                    <div className="text-sm text-neutral-500">Agencia</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-airbnb border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gold-yellow fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4">
                  "Publiqué mi casa y en 3 días ya tenía 5 interesados. El proceso fue súper sencillo y rápido. 100% recomendado."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-coral-red-light rounded-full flex items-center justify-center">
                    <Home className="h-5 w-5 text-coral-red" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800">Carlos Ramírez</div>
                    <div className="text-sm text-neutral-500">Vendedor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 gradient-pink-coral relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-vibrant rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-gold-yellow rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="py-16 px-8 text-center space-y-8">
              <div className="w-16 h-16 bg-gold-yellow rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="h-8 w-8 text-neutral-900" />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white">
                ¿Listo para comenzar?
              </h2>

              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Únete a miles de usuarios que ya confían en Livinning para encontrar su hogar ideal o
                hacer crecer su negocio inmobiliario.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/propiedades">
                  <Button
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-white/90 h-14 px-8 text-base font-semibold"
                  >
                    Explorar Propiedades
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
