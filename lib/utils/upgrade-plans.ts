// ============================================
// LIVINNING - Planes de Upgrade y Paquetes
// ============================================

import { UpgradePackage } from '@/types/upgrade';

/**
 * Límite de propiedades para usuarios regulares
 */
export const USER_PROPERTY_LIMIT = 1;

/**
 * Paquetes de upgrade disponibles para usuarios
 */
export const UPGRADE_PACKAGES: UpgradePackage[] = [
  {
    id: 'single',
    name: 'Propiedad Individual',
    description: 'Publica una propiedad adicional',
    properties: 1,
    price: 299,
    pricePerProperty: 299,
    features: [
      '1 propiedad adicional',
      'Publicación inmediata',
      'Válido por 60 días',
      'Métricas básicas'
    ],
  },
  {
    id: 'package_5',
    name: 'Paquete 5 Propiedades',
    description: 'Ideal para propietarios con múltiples inmuebles',
    properties: 5,
    price: 1199,
    pricePerProperty: 239.8,
    recommended: true,
    badge: 'Más popular',
    features: [
      '5 propiedades',
      'Ahorra 20% vs individual',
      'Válido por 90 días',
      'Métricas avanzadas',
      'Soporte prioritario'
    ],
  },
  {
    id: 'agency',
    name: 'Conviértete en Agencia',
    description: 'Propiedades ilimitadas con plan mensual',
    properties: 'unlimited',
    price: 1999,
    pricePerProperty: 0,
    badge: 'Recomendado',
    features: [
      'Propiedades ilimitadas',
      'Panel de agencia completo',
      'Analíticas avanzadas',
      'Branding personalizado',
      'Soporte dedicado',
      'API access'
    ],
  },
];

/**
 * Obtiene los paquetes sugeridos según el número de propiedades actuales
 */
export function getSuggestedPackages(currentProperties: number): UpgradePackage[] {
  // Si ya tiene 1 propiedad, sugerir todos los paquetes
  if (currentProperties >= USER_PROPERTY_LIMIT) {
    return UPGRADE_PACKAGES;
  }

  // Si no ha llegado al límite, no sugerir nada
  return [];
}

/**
 * Calcula el precio por propiedad de un paquete
 */
export function getPricePerProperty(pkg: UpgradePackage): number {
  if (pkg.pricePerProperty) {
    return pkg.pricePerProperty;
  }

  if (typeof pkg.properties === 'number' && pkg.properties > 0) {
    return pkg.price / pkg.properties;
  }

  return 0;
}
