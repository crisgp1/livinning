// ============================================
// LIVINNING - Constantes del Sistema
// ============================================

import { UserRole } from '@/types';

export const APP_NAME = 'Livinning';
export const APP_DESCRIPTION = 'Plataforma de bienes raíces';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// --- Rutas ---
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Public routes
  PROPERTIES: '/propiedades',
  PROPERTY_DETAIL: (id: string) => `/propiedades/${id}`,
  ABOUT: '/sobre-nosotros',
  CONTACT: '/contacto',

  // Dashboard routes
  DASHBOARD: {
    USER: '/dashboard/user',
    AGENCY: '/dashboard/agency',
    HELPDESK: '/dashboard/helpdesk',
    ADMIN: '/dashboard/admin',
    SUPERADMIN: '/dashboard/superadmin',
    PARTNER: '/dashboard/partner',
  },

  // Dashboard sub-routes
  USER_PROPERTIES: '/dashboard/user/propiedades',
  USER_FAVORITES: '/dashboard/user/favoritos',
  USER_PROFILE: '/dashboard/user/perfil',

  AGENCY_PROPERTIES: '/dashboard/agency/propiedades',
  AGENCY_NEW_PROPERTY: '/dashboard/agency/propiedades/nueva',
  AGENCY_ANALYTICS: '/dashboard/agency/analiticas',
  AGENCY_SUBSCRIPTION: '/dashboard/agency/suscripcion',

  ADMIN_USERS: '/dashboard/admin/usuarios',
  ADMIN_PROPERTIES: '/dashboard/admin/propiedades',
  ADMIN_SUBSCRIPTIONS: '/dashboard/admin/suscripciones',
  ADMIN_TICKETS: '/dashboard/admin/tickets',

  HELPDESK_TICKETS: '/dashboard/helpdesk/tickets',

  PARTNER_REFERRALS: '/dashboard/partner/referencias',
  PARTNER_COMMISSIONS: '/dashboard/partner/comisiones',
} as const;

// --- Jerarquía de Roles (nivel de permiso) ---
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  PARTNER: 2,
  AGENCY: 3,
  HELPDESK: 4,
  ADMIN: 5,
  SUPERADMIN: 6,
};

// --- Límites por Rol ---
export const PROPERTY_LIMITS: Record<UserRole, number | 'unlimited'> = {
  USER: 1,
  AGENCY: 'unlimited',
  HELPDESK: 0,
  ADMIN: 'unlimited',
  SUPERADMIN: 'unlimited',
  PARTNER: 0,
};

// --- Planes de Suscripción ---
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Básico',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Hasta 50 propiedades',
      'Analíticas básicas',
      'Soporte por email',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Propiedades ilimitadas',
      'Analíticas avanzadas',
      'Soporte prioritario 24/7',
      'Tour virtual 3D',
      'Destacados en búsquedas',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Todo de Premium',
      'API personalizada',
      'Gestor de cuenta dedicado',
      'Integración con sistemas externos',
      'Reportes personalizados',
    ],
  },
} as const;

// --- Comisiones de Partners ---
export const PARTNER_COMMISSION_PERCENTAGE = 10; // 10% del pago de la agencia

// --- Estados ---
export const PROPERTY_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  INACTIVE: 'inactive',
} as const;

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
} as const;

export const TICKET_STATUSES = {
  OPEN: 'open',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// --- Paginación ---
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// --- Validación ---
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// --- Imágenes ---
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_PROPERTY = 20;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// --- Monedas Soportadas ---
export const CURRENCIES = {
  USD: { symbol: '$', name: 'Dólares' },
  MXN: { symbol: '$', name: 'Pesos Mexicanos' },
  EUR: { symbol: '€', name: 'Euros' },
} as const;

// --- Mensajes de Error Comunes ---
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor',
  PROPERTY_LIMIT_REACHED: 'Has alcanzado el límite de propiedades',
  SUBSCRIPTION_REQUIRED: 'Se requiere suscripción activa',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
} as const;

// --- Colecciones de MongoDB ---
export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  SUBSCRIPTIONS: 'subscriptions',
  TICKETS: 'tickets',
  TICKET_MESSAGES: 'ticket_messages',
  COMMISSIONS: 'commissions',
  FAVORITES: 'favorites',
  USER_NOTIFICATIONS: 'user_notifications',
  PROPERTY_MODERATIONS: 'property_moderations',
  REPORTS: 'reports',
} as const;

// --- Razones de Reporte ---
export const REPORT_REASONS = {
  fraudulent: 'Fraudulento / Estafa',
  inappropriate_content: 'Contenido Inapropiado',
  incorrect_information: 'Información Incorrecta',
  duplicate: 'Publicación Duplicada',
  spam: 'Spam',
  offensive: 'Ofensivo / Abusivo',
  other: 'Otro',
} as const;
