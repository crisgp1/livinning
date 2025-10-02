// ============================================
// LIVINNING - Configuración de Dashboards por Rol
// ============================================

import { UserRole } from '@/types';
import { DashboardConfig } from './types';

export const DASHBOARD_CONFIGS: Record<UserRole, DashboardConfig> = {
  // ============================================
  // USER DASHBOARD
  // ============================================
  USER: {
    role: 'USER',
    title: 'Mi Espacio',
    description: 'Gestiona tu propiedad y favoritos',
    widgets: [
      {
        id: 'user-property',
        type: 'property-status',
        title: 'Mi Propiedad',
        description: 'Puedes publicar 1 propiedad gratis',
        gridArea: '1 / 1 / 2 / 2',
      },
      {
        id: 'user-favorites',
        type: 'favorites',
        title: 'Mis Favoritos',
        gridArea: '1 / 2 / 2 / 3',
      },
      {
        id: 'user-stats',
        type: 'stats',
        title: 'Estadísticas',
        description: 'Vistas y likes de tu propiedad',
        gridArea: '2 / 1 / 3 / 3',
      },
    ],
    layout: { columns: 2, rows: 2, gap: 'md' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/user', icon: 'LayoutDashboard' },
      { label: 'Mi Propiedad', href: '/dashboard/user/propiedades', icon: 'Home' },
      { label: 'Favoritos', href: '/dashboard/user/favoritos', icon: 'Heart' },
      { label: 'Perfil', href: '/dashboard/user/perfil', icon: 'User' },
    ],
    quickActions: [
      {
        label: 'Publicar Propiedad',
        href: '/dashboard/user/propiedades/nueva',
        variant: 'default',
        requiresCheck: 'propertyLimit',
      },
    ],
  },

  // ============================================
  // AGENCY DASHBOARD
  // ============================================
  AGENCY: {
    role: 'AGENCY',
    title: 'Panel de Agencia',
    description: 'Gestiona tu catálogo de propiedades',
    widgets: [
      {
        id: 'agency-stats',
        type: 'stats',
        title: 'Estadísticas Generales',
        gridArea: '1 / 1 / 2 / 4',
        config: {
          metrics: ['total_properties', 'views', 'leads', 'conversions'],
        },
      },
      {
        id: 'agency-chart',
        type: 'chart',
        title: 'Rendimiento Últimos 30 Días',
        gridArea: '2 / 1 / 3 / 3',
        config: { chartType: 'line', period: '30d' },
      },
      {
        id: 'agency-subscription',
        type: 'subscription-status',
        title: 'Estado de Suscripción',
        gridArea: '2 / 3 / 3 / 4',
      },
      {
        id: 'agency-properties',
        type: 'properties',
        title: 'Mis Propiedades',
        gridArea: '3 / 1 / 4 / 4',
        config: { limit: 10, sortBy: 'recent' },
      },
    ],
    layout: { columns: 3, rows: 3, gap: 'lg' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/agency', icon: 'LayoutDashboard' },
      { label: 'Verificación', href: '/dashboard/agency/verificacion', icon: 'ShieldCheck' },
      { label: 'Propiedades', href: '/dashboard/agency/propiedades', icon: 'Building' },
      { label: 'Nueva Propiedad', href: '/dashboard/agency/propiedades/nueva', icon: 'Plus' },
      { label: 'Analíticas', href: '/dashboard/agency/analiticas', icon: 'BarChart' },
      { label: 'Suscripción', href: '/dashboard/agency/suscripcion', icon: 'CreditCard' },
      { label: 'Perfil', href: '/dashboard/agency/perfil', icon: 'User' },
    ],
    quickActions: [
      {
        label: 'Publicar Propiedad',
        href: '/dashboard/agency/propiedades/nueva',
        variant: 'default',
      },
      {
        label: 'Ver Analíticas',
        href: '/dashboard/agency/analiticas',
        variant: 'outline',
      },
    ],
  },

  // ============================================
  // HELPDESK DASHBOARD
  // ============================================
  HELPDESK: {
    role: 'HELPDESK',
    title: 'Centro de Soporte',
    description: 'Gestión de tickets y soporte',
    widgets: [
      {
        id: 'helpdesk-pending',
        type: 'tickets',
        title: 'Tickets Pendientes',
        gridArea: '1 / 1 / 2 / 2',
        config: { status: 'pending' },
      },
      {
        id: 'helpdesk-stats',
        type: 'stats',
        title: 'Estadísticas de Soporte',
        gridArea: '1 / 2 / 2 / 3',
        config: {
          metrics: ['open_tickets', 'resolved_today', 'avg_response_time'],
        },
      },
      {
        id: 'helpdesk-recent',
        type: 'activity',
        title: 'Actividad Reciente',
        gridArea: '2 / 1 / 3 / 3',
      },
    ],
    layout: { columns: 2, rows: 2, gap: 'md' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/helpdesk', icon: 'LayoutDashboard' },
      { label: 'Órdenes', href: '/dashboard/helpdesk/ordenes', icon: 'ClipboardList' },
      { label: 'Moderación', href: '/dashboard/helpdesk/moderacion', icon: 'ShieldAlert' },
      { label: 'Tickets', href: '/dashboard/helpdesk/tickets', icon: 'MessageSquare' },
      {
        label: 'Usuarios',
        href: '/dashboard/helpdesk/usuarios',
        icon: 'Users',
        badge: 'Solo lectura',
      },
      { label: 'Partners', href: '/dashboard/helpdesk/partners', icon: 'Handshake' },
      { label: 'Perfil', href: '/dashboard/helpdesk/perfil', icon: 'User' },
    ],
  },

  // ============================================
  // ADMIN DASHBOARD
  // ============================================
  ADMIN: {
    role: 'ADMIN',
    title: 'Administración',
    description: 'Gestión completa de la plataforma',
    widgets: [
      {
        id: 'admin-platform-stats',
        type: 'stats',
        title: 'Estadísticas de la Plataforma',
        gridArea: '1 / 1 / 2 / 5',
        config: {
          metrics: ['users', 'agencies', 'properties', 'revenue'],
        },
      },
      {
        id: 'admin-pending-properties',
        type: 'properties',
        title: 'Propiedades Pendientes de Aprobación',
        gridArea: '2 / 1 / 3 / 3',
        config: { status: 'pending', limit: 5 },
      },
      {
        id: 'admin-recent-users',
        type: 'users',
        title: 'Usuarios Recientes',
        gridArea: '2 / 3 / 3 / 5',
      },
    ],
    layout: { columns: 4, rows: 2, gap: 'lg' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/admin', icon: 'LayoutDashboard' },
      { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: 'Users' },
      { label: 'Moderación', href: '/dashboard/admin/moderacion', icon: 'ShieldAlert' },
      {
        label: 'Suscripciones',
        href: '/dashboard/admin/suscripciones',
        icon: 'CreditCard',
      },
      { label: 'Partners', href: '/dashboard/admin/partners', icon: 'Handshake' },
      { label: 'Solicitudes Crédito', href: '/dashboard/admin/solicitudes-credito', icon: 'FileText' },
      { label: 'Tickets', href: '/dashboard/admin/tickets', icon: 'MessageSquare' },
      { label: 'Configuración', href: '/dashboard/admin/configuracion', icon: 'Settings' },
    ],
    quickActions: [
      {
        label: 'Aprobar Propiedades',
        href: '/dashboard/admin/propiedades?status=pending',
        variant: 'default',
      },
    ],
  },

  // ============================================
  // SUPERADMIN DASHBOARD
  // ============================================
  SUPERADMIN: {
    role: 'SUPERADMIN',
    title: 'Superadministración',
    description: 'Control total del sistema',
    widgets: [
      {
        id: 'superadmin-overview',
        type: 'stats',
        title: 'Vista General del Sistema',
        gridArea: '1 / 1 / 2 / 5',
        config: {
          metrics: [
            'total_users',
            'total_agencies',
            'total_properties',
            'total_revenue',
            'active_subscriptions',
            'pending_tickets',
          ],
        },
      },
      {
        id: 'superadmin-logs',
        type: 'system-logs',
        title: 'Logs del Sistema',
        gridArea: '2 / 1 / 3 / 3',
      },
      {
        id: 'superadmin-admins',
        type: 'users',
        title: 'Administradores',
        gridArea: '2 / 3 / 3 / 5',
        config: { role: 'ADMIN' },
      },
    ],
    layout: { columns: 4, rows: 2, gap: 'lg' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/superadmin', icon: 'LayoutDashboard' },
      { label: 'Usuarios', href: '/dashboard/superadmin/usuarios', icon: 'Users' },
      { label: 'Moderación', href: '/dashboard/superadmin/moderacion', icon: 'ShieldAlert' },
      {
        label: 'Suscripciones',
        href: '/dashboard/superadmin/suscripciones',
        icon: 'CreditCard',
      },
      { label: 'Partners', href: '/dashboard/superadmin/partners', icon: 'Handshake' },
      { label: 'Solicitudes Crédito', href: '/dashboard/superadmin/solicitudes-credito', icon: 'Coins' },
      { label: 'Tickets', href: '/dashboard/superadmin/tickets', icon: 'MessageSquare' },
      {
        label: 'Configuración',
        href: '/dashboard/superadmin/configuracion',
        icon: 'Settings',
      },
      { label: 'Logs', href: '/dashboard/superadmin/logs', icon: 'FileText' },
    ],
    quickActions: [
      {
        label: 'Ver Logs del Sistema',
        href: '/dashboard/superadmin/logs',
        variant: 'outline',
      },
    ],
  },

  // ============================================
  // PARTNER DASHBOARD
  // ============================================
  PARTNER: {
    role: 'PARTNER',
    title: 'Panel de Socio',
    description: 'Gestión de órdenes de servicio',
    widgets: [
      {
        id: 'partner-orders',
        type: 'stats',
        title: 'Mis Órdenes',
        gridArea: '1 / 1 / 2 / 2',
        config: { metrics: ['total', 'pending', 'completed'] },
      },
      {
        id: 'partner-earnings',
        type: 'chart',
        title: 'Ganancias por Mes',
        gridArea: '1 / 2 / 2 / 3',
        config: { chartType: 'bar', period: '6m' },
      },
      {
        id: 'partner-recent-orders',
        type: 'order-list',
        title: 'Órdenes Recientes',
        gridArea: '2 / 1 / 3 / 3',
      },
    ],
    layout: { columns: 2, rows: 2, gap: 'md' },
    navigation: [
      { label: 'Inicio', href: '/dashboard/partner', icon: 'LayoutDashboard' },
      { label: 'Verificación', href: '/dashboard/partner/verificacion', icon: 'ShieldCheck' },
      { label: 'Mis Órdenes', href: '/dashboard/partner/ordenes', icon: 'ClipboardList' },
      { label: 'Mensajes', href: '/dashboard/partner/mensajes', icon: 'MessageSquare' },
      { label: 'Créditos', href: '/dashboard/partner/creditos', icon: 'Coins' },
      { label: 'Perfil', href: '/dashboard/partner/perfil', icon: 'User' },
    ],
    quickActions: [
      {
        label: 'Ver Órdenes Pendientes',
        href: '/dashboard/partner/ordenes?status=assigned',
        variant: 'default',
      },
    ],
  },
};

/**
 * Obtiene la configuración del dashboard para un rol específico
 */
export function getDashboardConfig(role: UserRole): DashboardConfig {
  return DASHBOARD_CONFIGS[role];
}

/**
 * Verifica si un rol tiene un dashboard configurado
 */
export function hasDashboard(role: UserRole): boolean {
  return role in DASHBOARD_CONFIGS;
}
