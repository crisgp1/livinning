// ============================================
// LIVINNING - Servicio de Verificación de Agencias
// ============================================

import { clerkClient } from '@clerk/nextjs/server';
import { AgencyVerificationData, VerificationStatus } from '@/types/verification';

/**
 * Servicio para gestionar verificación de agencias
 * Principio de Responsabilidad Única (SRP): Solo maneja verificación de agencias
 */
export class VerificationService {
  /**
   * Obtiene el estado de verificación de una agencia
   */
  static async getVerificationStatus(userId: string): Promise<{
    status: VerificationStatus;
    isVerified: boolean;
    data?: AgencyVerificationData;
  }> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const status = (user.publicMetadata?.verificationStatus as VerificationStatus) || 'pending';
      const isVerified = (user.publicMetadata?.isVerified as boolean) || false;
      const verificationData = user.publicMetadata?.verificationData as AgencyVerificationData | undefined;

      return {
        status,
        isVerified,
        data: verificationData,
      };
    } catch (error) {
      console.error('Error obteniendo estado de verificación:', error);
      return {
        status: 'pending',
        isVerified: false,
      };
    }
  }

  /**
   * Envía una solicitud de verificación
   */
  static async submitVerification(
    userId: string,
    verificationData: AgencyVerificationData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const client = await clerkClient();

      const dataWithStatus: AgencyVerificationData = {
        ...verificationData,
        status: 'in_review',
        submittedAt: new Date(),
      };

      await client.users.updateUser(userId, {
        publicMetadata: {
          verificationStatus: 'in_review',
          verificationData: dataWithStatus,
          isVerified: false,
        },
      });

      console.log('✅ Verificación enviada para revisión:', userId);

      return {
        success: true,
        message: 'Solicitud de verificación enviada exitosamente',
      };
    } catch (error) {
      console.error('Error enviando verificación:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Aprueba una verificación (solo ADMIN/SUPERADMIN)
   */
  static async approveVerification(
    userId: string,
    reviewerId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const verificationData = user.publicMetadata?.verificationData as AgencyVerificationData;

      if (!verificationData) {
        throw new Error('No hay datos de verificación');
      }

      const updatedData: AgencyVerificationData = {
        ...verificationData,
        status: 'verified',
        verifiedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        reviewerNotes: notes,
      };

      await client.users.updateUser(userId, {
        publicMetadata: {
          verificationStatus: 'verified',
          verificationData: updatedData,
          isVerified: true,
        },
      });

      console.log('✅ Verificación aprobada:', userId);

      return {
        success: true,
        message: 'Verificación aprobada exitosamente',
      };
    } catch (error) {
      console.error('Error aprobando verificación:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Rechaza una verificación (solo ADMIN/SUPERADMIN)
   */
  static async rejectVerification(
    userId: string,
    reviewerId: string,
    reason: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const verificationData = user.publicMetadata?.verificationData as AgencyVerificationData;

      if (!verificationData) {
        throw new Error('No hay datos de verificación');
      }

      const updatedData: AgencyVerificationData = {
        ...verificationData,
        status: 'rejected',
        rejectedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        rejectionReason: reason,
        reviewerNotes: notes,
      };

      await client.users.updateUser(userId, {
        publicMetadata: {
          verificationStatus: 'rejected',
          verificationData: updatedData,
          isVerified: false,
        },
      });

      console.log('❌ Verificación rechazada:', userId, 'Razón:', reason);

      return {
        success: true,
        message: 'Verificación rechazada',
      };
    } catch (error) {
      console.error('Error rechazando verificación:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Verifica si una agencia necesita completar su verificación
   */
  static needsVerification(status: VerificationStatus, isVerified: boolean): boolean {
    return status === 'pending' || (status === 'rejected' && !isVerified);
  }
}
