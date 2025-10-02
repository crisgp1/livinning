// ============================================
// LIVINNING - API Route: Reports
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { ReportDocument } from '@/types/database';
import { ReportType, ReportReason } from '@/types';

/**
 * POST - Crear un reporte
 * Accesible para usuarios logueados y anónimos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, reason, description, propertyId, agencyId, reporterEmail, reporterName } = body;

    // Validaciones básicas
    if (!type || !reason || !description) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tipo, razón y descripción son requeridos',
          },
        },
        { status: 400 }
      );
    }

    if (type === 'property' && !propertyId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'propertyId es requerido para reportes de propiedades',
          },
        },
        { status: 400 }
      );
    }

    if (type === 'agency' && !agencyId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'agencyId es requerido para reportes de agencias',
          },
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario está autenticado
    const { userId } = await auth();
    let reporterId: string | undefined;
    let reporterNameFinal: string | undefined;
    let reporterEmailFinal: string | undefined;

    if (userId) {
      // Usuario logueado
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      reporterId = userId;
      reporterNameFinal = user.fullName || user.firstName || 'Usuario';
      reporterEmailFinal = user.primaryEmailAddress?.emailAddress;
    } else {
      // Usuario anónimo - requiere email y nombre
      if (!reporterEmail || !reporterName) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Email y nombre son requeridos para reportes anónimos',
            },
          },
          { status: 400 }
        );
      }
      reporterNameFinal = reporterName;
      reporterEmailFinal = reporterEmail;
    }

    // Obtener información adicional según el tipo de reporte
    let propertyTitle: string | undefined;
    let agencyName: string | undefined;
    let finalAgencyId = agencyId;

    if (type === 'property' && propertyId) {
      // Obtener título y dueño de la propiedad
      const propertiesCollection = await getCollection(COLLECTIONS.PROPERTIES);
      const property = await propertiesCollection.findOne({ _id: propertyId as any });
      propertyTitle = property?.title || 'Propiedad sin título';

      // Obtener el ownerId de la propiedad para poder suspender al usuario
      if (property?.ownerId) {
        finalAgencyId = property.ownerId;

        // Obtener nombre del dueño
        const client = await clerkClient();
        try {
          const owner = await client.users.getUser(property.ownerId);
          agencyName = (owner.publicMetadata?.companyName as string) || owner.fullName || owner.firstName || 'Usuario';
        } catch (error) {
          console.error('Error getting owner info:', error);
          agencyName = property.ownerName || 'Usuario';
        }
      }
    }

    if (type === 'agency' && agencyId) {
      // Obtener nombre de la agencia
      const client = await clerkClient();
      const agency = await client.users.getUser(agencyId);
      agencyName = (agency.publicMetadata?.companyName as string) || agency.fullName || 'Agencia';
    }

    // Crear el reporte
    const now = new Date();
    const reportDoc: Omit<ReportDocument, '_id'> = {
      type: type as ReportType,
      reason: reason as ReportReason,
      description,
      status: 'pending',
      reporterId,
      reporterName: reporterNameFinal,
      reporterEmail: reporterEmailFinal,
      propertyId,
      propertyTitle,
      agencyId: finalAgencyId,
      agencyName,
      createdAt: now,
      updatedAt: now,
    };

    const reportsCollection = await getCollection<ReportDocument>(COLLECTIONS.REPORTS);
    const result = await reportsCollection.insertOne(reportDoc as any);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.',
          reportId: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/reports:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear el reporte',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener reportes (solo para administradores)
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

    // Verificar permisos de administrador
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver reportes',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all'; // all, pending, reviewing, resolved, dismissed
    const type = searchParams.get('type') || 'all'; // all, property, agency

    // Construir query
    const query: any = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (type !== 'all') {
      query.type = type;
    }

    const reportsCollection = await getCollection<ReportDocument>(COLLECTIONS.REPORTS);

    // Obtener total
    const total = await reportsCollection.countDocuments(query);

    // Obtener reportes
    const skip = (page - 1) * limit;
    const reports = await reportsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Mapear a formato de respuesta
    const mappedReports = reports.map((doc) => ({
      id: doc._id.toString(),
      type: doc.type,
      reason: doc.reason,
      description: doc.description,
      status: doc.status,
      reporterId: doc.reporterId,
      reporterName: doc.reporterName,
      reporterEmail: doc.reporterEmail,
      propertyId: doc.propertyId,
      propertyTitle: doc.propertyTitle,
      agencyId: doc.agencyId,
      agencyName: doc.agencyName,
      reviewedBy: doc.reviewedBy,
      reviewedByName: doc.reviewedByName,
      reviewedAt: doc.reviewedAt,
      reviewNotes: doc.reviewNotes,
      moderationAction: doc.moderationAction,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          reports: mappedReports,
          total,
          page,
          limit,
          hasMore: total > page * limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/reports:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener reportes',
        },
      },
      { status: 500 }
    );
  }
}
