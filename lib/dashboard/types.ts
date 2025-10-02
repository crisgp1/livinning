// ============================================
// LIVINNING - Tipos para Dashboard System
// ============================================

import { UserRole } from '@/types';
import { ReactNode } from 'react';

// --- Widget Types ---
export type WidgetType =
  | 'stats'
  | 'chart'
  | 'properties'
  | 'property-status'
  | 'favorites'
  | 'users'
  | 'tickets'
  | 'subscription-status'
  | 'commissions'
  | 'referral-list'
  | 'activity'
  | 'system-logs';

// --- Widget Configuration ---
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  gridArea: string; // CSS Grid area
  config?: Record<string, any>; // Configuración específica del widget
}

// --- Dashboard Layout ---
export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: 'sm' | 'md' | 'lg';
}

// --- Navigation Item ---
export interface NavItem {
  label: string;
  href: string;
  icon: string; // Nombre del icono de Lucide
  badge?: string | number;
}

// --- Quick Action ---
export interface QuickAction {
  label: string;
  href?: string;
  action?: string; // Nombre de la acción a ejecutar
  variant?: 'default' | 'outline' | 'ghost';
  requiresCheck?: string; // Nombre del check a realizar antes
}

// --- Dashboard Configuration ---
export interface DashboardConfig {
  role: UserRole;
  title: string;
  description: string;
  widgets: Widget[];
  layout: DashboardLayout;
  navigation: NavItem[];
  quickActions?: QuickAction[];
}

// --- Widget Props ---
export interface BaseWidgetProps {
  id: string;
  title: string;
  description?: string;
  config?: Record<string, any>;
}

// --- Stats Widget Data ---
export interface StatsData {
  label: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: string;
}

// --- Chart Data ---
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// --- Dashboard Context ---
export interface DashboardContextValue {
  config: DashboardConfig;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
