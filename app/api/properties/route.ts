// ============================================
// LIVINNING - API Route: Properties
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  listProperties,
  searchProperties,
  createProperty,
  countUserProperties
} from '@/lib/db/models/property';
import { ApiResponse } from '@/types/api';
import { PropertyDocument } from '@/types/database';
import { GeocodingService } from '@/lib/services/geocoding.service';

/**
 * GET - Listar propiedades públicas
 * Soporta filtros y búsqueda
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de búsqueda
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const propertyType = searchParams.get('propertyType');
    const transactionType = searchParams.get('transactionType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    console.log('GET /api/properties - Params:', {
      search,
      city,
      propertyType,
      transactionType,
      page,
      limit,
    });

    let result;

    // Si hay búsqueda por texto, usar searchProperties
    if (search && search.trim()) {
      result = await searchProperties(search, {
        city: city || undefined,
        propertyType: propertyType || undefined,
        transactionType: transactionType || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
    } else {
      // Usar listProperties con filtros
      result = await listProperties({
        status: 'active', // Solo mostrar propiedades activas en el público
        city: city || undefined,
        state: state || undefined,
        propertyType: propertyType || undefined,
        transactionType: transactionType || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        minArea: minArea ? parseInt(minArea) : undefined,
        maxArea: maxArea ? parseInt(maxArea) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 12,
        sortBy: sortBy || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      });
    }

    console.log(`✅ Found ${result.properties.length} properties (total: ${result.total})`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          properties: result.properties,
          total: result.total,
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 12,
          totalPages: Math.ceil(result.total / (limit ? parseInt(limit) : 12)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/properties:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener propiedades',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear una nueva propiedad
 * Requiere autenticación
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No autenticado',
          },
        },
        { status: 401 }
      );
    }

    console.log('POST /api/properties - User:', userId);

    // Obtener datos del request
    const body = await request.json();
    const {
      title,
      description,
      price,
      address,
      city,
      state,
      country,
      zipCode,
      propertyType,
      transactionType,
      bedrooms,
      bathrooms,
      area,
      parkingSpaces,
      images,
      coordinates,
    } = body;

    // Validaciones básicas
    if (!title || !price || !address || !city || !state || !propertyType || !transactionType || !area) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Campos requeridos: title, price, address, city, state, propertyType, transactionType, area',
          },
        },
        { status: 400 }
      );
    }

    // Obtener metadata del usuario desde Clerk
    const userRole = (user.publicMetadata?.role as string) || 'USER';
    const propertyLimit = user.publicMetadata?.propertyLimit as number | string | undefined;
    const subscriptionStatus = user.publicMetadata?.subscriptionStatus as string | undefined;

    // Contar propiedades actuales del usuario
    const currentPropertyCount = await countUserProperties(userId);

    console.log('User limits:', {
      role: userRole,
      propertyLimit,
      currentCount: currentPropertyCount,
      subscriptionStatus,
    });

    // Validar límites según el rol
    if (userRole === 'USER') {
      const limit = typeof propertyLimit === 'number' ? propertyLimit : 1;
      if (currentPropertyCount >= limit) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'LIMIT_REACHED',
              message: `Has alcanzado el límite de ${limit} propiedad${limit > 1 ? 'es' : ''}. Actualiza tu plan para publicar más propiedades.`,
            },
          },
          { status: 403 }
        );
      }
    } else if (userRole === 'AGENCY') {
      if (subscriptionStatus !== 'active') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'SUBSCRIPTION_INACTIVE',
              message: 'Tu suscripción no está activa. Reactiva tu plan para publicar propiedades.',
            },
          },
          { status: 403 }
        );
      }
    }

    // Geocodificar dirección si no se proporcionaron coordenadas
    let finalCoordinates = coordinates;

    if (!coordinates || !GeocodingService.isValidCoordinates(coordinates?.lat, coordinates?.lng)) {
      console.log('Geocoding address...');
      const geocodeResult = await GeocodingService.geocodeAddress(
        address,
        city,
        state,
        country || 'México'
      );

      if (geocodeResult) {
        finalCoordinates = {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
        };
        console.log('✅ Address geocoded successfully:', finalCoordinates);
      } else {
        console.warn('⚠️ Could not geocode address, property will be created without coordinates');
      }
    }

    // Preparar datos de la propiedad
    const propertyData: Omit<PropertyDocument, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'leads'> = {
      title,
      description: description || '',
      price: parseFloat(price),
      currency: '$',
      address,
      city,
      state,
      country: country || 'México',
      zipCode: zipCode || '',
      coordinates: finalCoordinates || undefined,
      propertyType,
      transactionType,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
      area: parseFloat(area),
      parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : undefined,
      images: images || [],
      videos: [],
      ownerId: userId, // Clerk user ID (string)
      ownerType: userRole === 'AGENCY' ? 'AGENCY' : 'USER',
      ownerName: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || 'Usuario',
      status: 'active', // Por ahora activar directamente, después se puede agregar moderación
    };

    console.log('Creating property with coordinates:', propertyData.coordinates);

    // Crear la propiedad
    const newProperty = await createProperty(propertyData);

    console.log('✅ Property created:', newProperty.id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { property: newProperty },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/properties:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear propiedad',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
