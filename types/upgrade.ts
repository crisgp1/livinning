// ============================================
// LIVINNING - Tipos para Sistema de Upgrade
// ============================================

export type UpgradePackageType = 'single' | 'package_5' | 'agency';

export interface UpgradePackage {
  id: UpgradePackageType;
  name: string;
  description: string;
  properties: number | 'unlimited';
  price: number;
  pricePerProperty?: number;
  recommended?: boolean;
  features: string[];
  badge?: string;
}

export interface PropertyLimitInfo {
  current: number;
  max: number | 'unlimited';
  canPublish: boolean;
  requiresUpgrade: boolean;
  suggestedPackages: UpgradePackage[];
}

export interface UpgradeCheckoutData {
  packageType: UpgradePackageType;
  userId: string;
  userEmail: string;
  userName: string;
  quantity?: number;
}
