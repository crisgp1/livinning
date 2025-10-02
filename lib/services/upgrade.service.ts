// ============================================
// LIVINNING - Servicio de Upgrades de Usuario
// ============================================

import { clerkClient } from '@clerk/nextjs/server';
import { UpgradePackageType } from '@/types/upgrade';

/**
 * Servicio para procesar upgrades de usuarios
 * Principio de Responsabilidad Única (SRP): Solo maneja la lógica de upgrades
 */
export class UpgradeService {
  /**
   * Procesa el upgrade de un usuario después de un pago exitoso
   */
  static async processUpgrade(
    userId: string,
    packageType: UpgradePackageType,
    sessionId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Procesando upgrade para usuario ${userId}, paquete: ${packageType}`);

      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const currentRole = (user.publicMetadata?.role as string) || 'USER';
      const currentPropertyCount = (user.publicMetadata?.propertyCount as number) || 0;
      const currentPropertyLimit = (user.publicMetadata?.propertyLimit as number) || 1;

      let updatedMetadata: Record<string, any> = { ...user.publicMetadata };

      switch (packageType) {
        case 'single':
          // Incrementar límite en 1
          updatedMetadata.propertyLimit = currentPropertyLimit + 1;
          updatedMetadata.lastUpgrade = new Date().toISOString();
          updatedMetadata.lastUpgradeType = 'single';
          updatedMetadata.lastUpgradeSession = sessionId;
          console.log(`Límite incrementado de ${currentPropertyLimit} a ${currentPropertyLimit + 1}`);
          break;

        case 'package_5':
          // Incrementar límite en 5
          updatedMetadata.propertyLimit = currentPropertyLimit + 5;
          updatedMetadata.lastUpgrade = new Date().toISOString();
          updatedMetadata.lastUpgradeType = 'package_5';
          updatedMetadata.lastUpgradeSession = sessionId;
          console.log(`Límite incrementado de ${currentPropertyLimit} a ${currentPropertyLimit + 5}`);
          break;

        case 'agency':
          // Convertir a agencia (propiedades ilimitadas)
          updatedMetadata.role = 'AGENCY';
          updatedMetadata.propertyLimit = 'unlimited';
          updatedMetadata.subscriptionStatus = 'active';
          updatedMetadata.upgradedToAgencyAt = new Date().toISOString();
          updatedMetadata.lastUpgradeSession = sessionId;
          updatedMetadata.verificationStatus = 'pending'; // Estado de verificación
          updatedMetadata.isVerified = false;
          console.log(`Usuario convertido a AGENCY (propiedades ilimitadas)`);
          console.log(`Estado de verificación: pending - Necesita verificarse`);
          break;

        default:
          throw new Error(`Tipo de paquete desconocido: ${packageType}`);
      }

      // Actualizar metadata en Clerk
      await client.users.updateUser(userId, {
        publicMetadata: updatedMetadata,
      });

      console.log('Metadata actualizado exitosamente:', updatedMetadata);

      return {
        success: true,
        message: 'Upgrade procesado exitosamente',
      };
    } catch (error) {
      console.error('Error procesando upgrade:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene el límite de propiedades actual de un usuario
   */
  static async getUserPropertyLimit(userId: string): Promise<number | 'unlimited'> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        return 1; // Límite por defecto
      }

      const role = (user.publicMetadata?.role as string) || 'USER';

      if (role === 'AGENCY') {
        return 'unlimited';
      }

      return (user.publicMetadata?.propertyLimit as number) || 1;
    } catch (error) {
      console.error('Error obteniendo límite de propiedades:', error);
      return 1;
    }
  }

  /**
   * Verifica si un usuario puede publicar más propiedades
   */
  static async canPublishProperty(userId: string): Promise<boolean> {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!user) {
        return false;
      }

      const role = (user.publicMetadata?.role as string) || 'USER';
      const propertyCount = (user.publicMetadata?.propertyCount as number) || 0;
      const propertyLimit = (user.publicMetadata?.propertyLimit as number) || 1;

      // Las agencias pueden publicar ilimitadas
      if (role === 'AGENCY') {
        return true;
      }

      // Los usuarios normales están limitados
      return propertyCount < propertyLimit;
    } catch (error) {
      console.error('Error verificando si puede publicar:', error);
      return false;
    }
  }
}
