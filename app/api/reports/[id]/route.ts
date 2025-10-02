// ============================================
// LIVINNING - API Route: Update Report
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { ReportDocument } from '@/types/database';
import { ObjectId } from 'mongodb';
import { ReportStatus } from '@/types';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH - Actualizar estado de un reporte
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para revisar reportes',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes, action, propertyId, agencyId } = body;

    logger.info(`📥 PATCH /api/reports/${id} - Body received:`, JSON.stringify({ status, reviewNotes, action, propertyId, agencyId }));

    if (!status || !reviewNotes) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Estado y notas de revisión son requeridos',
          },
        },
        { status: 400 }
      );
    }

    const reportsCollection = await getCollection<ReportDocument>(COLLECTIONS.REPORTS);

    // Actualizar el reporte
    const result = await reportsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status as ReportStatus,
          reviewedBy: userId,
          reviewedByName: currentUser.fullName || currentUser.firstName || 'Admin',
          reviewedAt: new Date(),
          reviewNotes,
          moderationAction: action || 'none',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Reporte no encontrado',
          },
        },
        { status: 404 }
      );
    }

    // Ejecutar acciones de moderación
    if (action && action !== 'none') {
      logger.info(`🔧 Executing moderation action: ${action} for propertyId: ${propertyId}, agencyId: ${agencyId}`);
      const propertiesCollection = await getCollection(COLLECTIONS.PROPERTIES);
      const notificationsCollection = await getCollection(COLLECTIONS.USER_NOTIFICATIONS);

      if ((action === 'suspend_property' || action === 'suspend_both') && propertyId) {
        logger.info(`🚫 Suspending property: ${propertyId}`);
        // Suspender propiedad
        const updateResult = await propertiesCollection.updateOne(
          { _id: new ObjectId(propertyId) },
          {
            $set: {
              status: 'inactive',
              updatedAt: new Date(),
            },
          }
        );
        logger.info(`✅ Property update result - matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount}`);

        // Obtener info de la propiedad para la notificación
        const property = await propertiesCollection.findOne({ _id: new ObjectId(propertyId) });

        if (property) {
          // Crear notificación para el dueño
          await notificationsCollection.insertOne({
            userId: property.ownerId,
            type: 'violation',
            severity: 'high',
            title: '🚫 Publicación Suspendida',
            message: `Tu propiedad "${property.title}" ha sido suspendida debido a un reporte.\n\nMotivo: ${reviewNotes}`,
            relatedId: propertyId,
            relatedType: 'property',
            isRead: false,
            createdAt: new Date(),
          } as any);
        }
      }

      if ((action === 'suspend_user' || action === 'suspend_both') && agencyId) {
        logger.info(`🚫 Suspending user: ${agencyId}`);

        // Obtener usuario a suspender
        const userToSuspend = await client.users.getUser(agencyId);
        logger.info(`📋 User to suspend - Role: ${userToSuspend.publicMetadata?.role}, Email: ${userToSuspend.primaryEmailAddress?.emailAddress}`);

        // Verificar que no sea SUPERADMIN
        const targetRole = (userToSuspend.publicMetadata?.role as string)?.toUpperCase();
        if (targetRole === 'SUPERADMIN') {
          logger.warn(`⚠️ Cannot suspend SUPERADMIN user ${agencyId}`);
        } else {
          // Verificar si ya fue suspendido antes
          const wasPreviouslySuspended = userToSuspend.publicMetadata?.isSuspended === true;
          const suspensionCount = (userToSuspend.publicMetadata?.suspensionCount as number) || 0;
          const isPermanentlySuspended = wasPreviouslySuspended && suspensionCount >= 1;

          // Suspender usuario en Clerk usando updateUserMetadata
          const suspensionReason = `Reportado: ${reviewNotes}`;
          await client.users.updateUserMetadata(agencyId, {
            publicMetadata: {
              ...userToSuspend.publicMetadata,
              isSuspended: true,
              suspendedAt: new Date().toISOString(),
              suspendedBy: userId,
              suspensionReason,
              suspensionCount: suspensionCount + 1,
              isPermanentlySuspended: isPermanentlySuspended,
            },
          });
          logger.info(`✅ User ${agencyId} suspended in Clerk - Suspension count: ${suspensionCount + 1}, Permanent: ${isPermanentlySuspended}`);

          // Revocar todas las sesiones activas
          try {
            const sessions = await client.sessions.getSessionList({ userId: agencyId });
            logger.info(`🔒 Found ${sessions.data.length} active sessions for user ${agencyId}`);
            for (const session of sessions.data) {
              await client.sessions.revokeSession(session.id);
              logger.info(`✅ Session ${session.id} revoked`);
            }
          } catch (sessionError) {
            logger.error(`Error revoking sessions for user ${agencyId}: ${sessionError}`);
          }

          // Crear notificación
          await notificationsCollection.insertOne({
            userId: agencyId,
            type: 'violation',
            severity: 'high',
            title: '🚫 Cuenta Suspendida',
            message: `Tu cuenta ha sido suspendida debido a violaciones de nuestros términos de servicio.\n\nMotivo: ${reviewNotes}`,
            isRead: false,
            createdAt: new Date(),
          } as any);
          logger.info(`📧 Notification created for suspended user ${agencyId}`);
        }
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Reporte actualizado exitosamente',
          report: {
            id: result._id.toString(),
            status: result.status,
            reviewedBy: result.reviewedBy,
            reviewedByName: result.reviewedByName,
            reviewedAt: result.reviewedAt,
            reviewNotes: result.reviewNotes,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in PATCH /api/reports/[id]: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar el reporte',
        },
      },
      { status: 500 }
    );
  }
}
