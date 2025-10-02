// ============================================
// LIVINNING - API Route: Moderate Property
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ObjectId } from 'mongodb';
import { ApiResponse } from '@/types/api';
import {
  PropertyDocument,
  PropertyModerationDocument,
  PropertyFieldViolation,
  UserNotificationDocument,
} from '@/types/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface ModerationRequest {
  action: 'approve' | 'reject' | 'request_corrections';
  fieldViolations?: PropertyFieldViolation[];
  generalNotes?: string;
}

/**
 * POST - Moderar propiedad
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 * Principio de Responsabilidad Única: Solo modera propiedades
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Obtener el usuario actual para verificar rol
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    // Solo SUPERADMIN, ADMIN y HELPDESK pueden moderar
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para moderar propiedades',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: ModerationRequest = await request.json();
    const { action, fieldViolations, generalNotes } = body;

    // Validar ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID de propiedad inválido',
          },
        },
        { status: 400 }
      );
    }

    // Validar acción
    if (!['approve', 'reject', 'request_corrections'].includes(action)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Acción de moderación inválida',
          },
        },
        { status: 400 }
      );
    }

    // Validar que si hay violaciones, la acción sea request_corrections o reject
    if (fieldViolations && fieldViolations.length > 0) {
      if (action === 'approve') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'No puedes aprobar una propiedad con violaciones',
            },
          },
          { status: 400 }
        );
      }
    }

    // Obtener propiedad
    const propertiesCollection = await getCollection<PropertyDocument>(
      COLLECTIONS.PROPERTIES
    );

    const property = await propertiesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!property) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Propiedad no encontrada',
          },
        },
        { status: 404 }
      );
    }

    // Determinar el nuevo estado de la propiedad
    let newStatus: PropertyDocument['status'];
    let moderationStatus: PropertyDocument['moderationStatus'];

    switch (action) {
      case 'approve':
        newStatus = 'active';
        moderationStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        moderationStatus = 'rejected';
        break;
      case 'request_corrections':
        newStatus = 'pending';
        moderationStatus = 'needs_correction';
        break;
    }

    // Actualizar propiedad
    await propertiesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: newStatus,
          moderationStatus: moderationStatus,
          moderatedBy: userId,
          moderatedAt: new Date(),
          fieldViolations: fieldViolations || [],
          moderationNotes: generalNotes || '',
          updatedAt: new Date(),
        },
      }
    );

    // Crear registro de moderación
    const moderationsCollection = await getCollection<PropertyModerationDocument>(
      COLLECTIONS.PROPERTY_MODERATIONS
    );

    const moderationRecord: Omit<PropertyModerationDocument, '_id'> = {
      propertyId: new ObjectId(id),
      propertyTitle: property.title,
      ownerId: property.ownerId,
      ownerName: property.ownerName,
      action,
      fieldViolations: fieldViolations || [],
      generalNotes: generalNotes || '',
      moderatedBy: userId,
      moderatedByName: currentUser.fullName || currentUser.firstName || 'Admin',
      moderatedAt: new Date(),
      notificationSent: false,
      createdAt: new Date(),
    };

    const moderationResult = await moderationsCollection.insertOne(
      moderationRecord as any
    );

    // Crear notificación para el usuario
    const notificationsCollection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType: UserNotificationDocument['type'];
    let notificationSeverity: UserNotificationDocument['severity'];

    switch (action) {
      case 'approve':
        notificationTitle = '✅ Propiedad Aprobada';
        notificationMessage = `Tu propiedad "${property.title}" ha sido aprobada y ahora está publicada.`;
        notificationType = 'info';
        notificationSeverity = 'low';
        break;
      case 'reject':
        notificationTitle = '❌ Propiedad Rechazada';
        notificationMessage = `Tu propiedad "${property.title}" ha sido rechazada.\n\nMotivo: ${generalNotes || 'Violación de términos de servicio'}`;
        notificationType = 'violation';
        notificationSeverity = 'high';
        break;
      case 'request_corrections':
        const violationsList = fieldViolations && fieldViolations.length > 0
          ? '\n\nCampos con problemas:\n' + fieldViolations.map(v => `• ${v.field}: ${v.message}`).join('\n')
          : '';
        notificationMessage = `Tu propiedad "${property.title}" necesita correcciones antes de ser publicada.${violationsList}\n\n${generalNotes ? `Notas adicionales: ${generalNotes}` : ''}`;
        notificationTitle = '⚠️ Correcciones Requeridas';
        notificationType = 'warning';
        notificationSeverity = fieldViolations && fieldViolations.length > 5 ? 'high' : 'medium';
        break;
    }

    const notification: Omit<UserNotificationDocument, '_id'> = {
      userId: property.ownerId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      severity: notificationSeverity,
      isRead: false,
      createdBy: userId,
      createdByName: currentUser.fullName || currentUser.firstName || 'Admin',
      createdAt: new Date(),
    };

    const notificationResult = await notificationsCollection.insertOne(
      notification as any
    );

    // Actualizar registro de moderación con ID de notificación
    await moderationsCollection.updateOne(
      { _id: moderationResult.insertedId },
      {
        $set: {
          notificationSent: true,
          notificationId: notificationResult.insertedId,
        },
      }
    );

    console.log(
      `✅ Property ${id} moderated (${action}) by ${userId}, notification sent to ${property.ownerId}`
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Propiedad moderada exitosamente',
          action,
          notificationSent: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/properties/[id]/moderate:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al moderar propiedad',
        },
      },
      { status: 500 }
    );
  }
}
