// ============================================
// LIVINNING - API Route: Favorites List with Properties
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ObjectId } from 'mongodb';
import { ApiResponse } from '@/types/api';
import { PropertyDocument } from '@/types/database';
import { propertyDocumentToProperty } from '@/lib/db/models/property';

interface FavoriteDocument {
  _id: ObjectId;
  userId: string;
  propertyId: ObjectId;
  createdAt: Date;
}

/**
 * GET - Obtener favoritos del usuario con propiedades completas
 * Principio de Responsabilidad Única: Solo obtiene favoritos con sus propiedades
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
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

    const favoritesCollection = await getCollection<FavoriteDocument>(COLLECTIONS.FAVORITES);
    const propertiesCollection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

    // Obtener favoritos del usuario
    const favorites = await favoritesCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    if (favorites.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { favorites: [], total: 0 },
        },
        { status: 200 }
      );
    }

    // Obtener IDs de propiedades
    const propertyIds = favorites.map((f) => f.propertyId);

    // Buscar propiedades
    const properties = await propertiesCollection
      .find({ _id: { $in: propertyIds } })
      .toArray();

    // Convertir a tipo Property y mantener el orden de favoritos
    const favoritesWithProperties = favorites
      .map((favorite) => {
        const property = properties.find(
          (p) => p._id.toString() === favorite.propertyId.toString()
        );

        if (!property) return null;

        return {
          favoriteId: favorite._id.toString(),
          addedAt: favorite.createdAt,
          property: propertyDocumentToProperty(property),
        };
      })
      .filter((item) => item !== null);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          favorites: favoritesWithProperties,
          total: favoritesWithProperties.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/favorites/list:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener favoritos',
        },
      },
      { status: 500 }
    );
  }
}
