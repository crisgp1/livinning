// ============================================
// LIVINNING - API Route: Favorites (with Clerk)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ObjectId } from 'mongodb';
import { ApiResponse } from '@/types/api';

interface FavoriteDocument {
  _id: ObjectId;
  userId: string; // Clerk user ID
  propertyId: ObjectId;
  createdAt: Date;
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'propertyId es requerido',
          },
        },
        { status: 400 }
      );
    }

    const collection = await getCollection<FavoriteDocument>(COLLECTIONS.FAVORITES);

    // Verificar si ya existe
    const existing = await collection.findOne({
      userId: userId,
      propertyId: new ObjectId(propertyId),
    });

    if (existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Ya está en favoritos',
          },
        },
        { status: 400 }
      );
    }

    // Crear favorito
    await collection.insertOne({
      _id: new ObjectId(),
      userId: userId, // Store Clerk userId as string
      propertyId: new ObjectId(propertyId),
      createdAt: new Date(),
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Agregado a favoritos' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al agregar a favoritos',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'propertyId es requerido',
          },
        },
        { status: 400 }
      );
    }

    const collection = await getCollection<FavoriteDocument>(COLLECTIONS.FAVORITES);

    const result = await collection.deleteOne({
      userId: userId,
      propertyId: new ObjectId(propertyId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No está en favoritos',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Eliminado de favoritos' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al eliminar de favoritos',
        },
      },
      { status: 500 }
    );
  }
}

// GET - Get user's favorites
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

    const collection = await getCollection<FavoriteDocument>(COLLECTIONS.FAVORITES);

    const favorites = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { favorites: favorites.map((f) => f.propertyId.toString()) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
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
