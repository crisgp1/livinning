// ============================================
// LIVINNING - Servicio de Límites de Propiedades
// ============================================

import { User, UserRole } from '@/types';
import { PropertyLimitInfo } from '@/types/upgrade';
import { USER_PROPERTY_LIMIT, getSuggestedPackages } from '@/lib/utils/upgrade-plans';

/**
 * Servicio que maneja la lógica de límites de propiedades
 * Principio de Responsabilidad Única (SRP): Solo se encarga de calcular límites
 */
export class PropertyLimitService {
  /**
   * Verifica si un usuario puede publicar una propiedad
   */
  static canPublishProperty(user: User): boolean {
    switch (user.role) {
      case 'USER':
        return (user.propertyCount ?? 0) < USER_PROPERTY_LIMIT;

      case 'AGENCY':
        // Las agencias pueden publicar ilimitadas si tienen suscripción activa
        return user.subscriptionStatus === 'active';

      default:
        return false;
    }
  }

  /**
   * Obtiene el límite máximo de propiedades para un usuario
   */
  static getPropertyLimit(user: User): number | 'unlimited' {
    switch (user.role) {
      case 'USER':
        // Usar el límite personalizado si existe, sino usar el límite por defecto
        return (user as any).propertyLimit || USER_PROPERTY_LIMIT;

      case 'AGENCY':
        return user.subscriptionStatus === 'active' ? 'unlimited' : 0;

      default:
        return 0;
    }
  }

  /**
   * Obtiene información completa sobre los límites de un usuario
   */
  static getPropertyLimitInfo(user: User): PropertyLimitInfo {
    const current = user.propertyCount ?? 0;
    const max = this.getPropertyLimit(user);
    const canPublish = this.canPublishProperty(user);
    const requiresUpgrade = !canPublish && user.role === 'USER';

    const suggestedPackages = requiresUpgrade
      ? getSuggestedPackages(current)
      : [];

    return {
      current,
      max,
      canPublish,
      requiresUpgrade,
      suggestedPackages,
    };
  }

  /**
   * Verifica si un usuario debe ver el modal de upgrade
   */
  static shouldShowUpgradeModal(user: User): boolean {
    if (user.role !== 'USER') {
      return false;
    }

    const current = user.propertyCount ?? 0;
    return current >= USER_PROPERTY_LIMIT;
  }

  /**
   * Verifica si un usuario debe ver el botón de upgrade
   */
  static shouldShowUpgradeButton(user: User): boolean {
    return user.role === 'USER';
  }

  /**
   * Obtiene el mensaje de límite alcanzado
   */
  static getLimitReachedMessage(user: User): string {
    if (user.role === 'USER') {
      return `Has alcanzado el límite de ${USER_PROPERTY_LIMIT} propiedad${USER_PROPERTY_LIMIT > 1 ? 'es' : ''} gratis`;
    }

    if (user.role === 'AGENCY' && user.subscriptionStatus !== 'active') {
      return 'Tu suscripción no está activa. Reactiva tu plan para publicar propiedades.';
    }

    return 'No puedes publicar propiedades en este momento.';
  }
}
