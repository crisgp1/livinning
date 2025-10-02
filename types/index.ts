// ============================================
// LIVINNING - Sistema de Tipos Base
// ============================================

// --- Roles del Sistema ---
export type UserRole =
  | 'USER'
  | 'AGENCY'
  | 'HELPDESK'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'PARTNER';

// --- Tipos de Suscripción ---
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';
export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

// --- Estados de Propiedades ---
export type PropertyStatus = 'active' | 'pending' | 'rejected' | 'inactive';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'office';
export type TransactionType = 'sale' | 'rent';
export type LocationType = 'city' | 'beach' | 'mountain' | 'countryside' | 'lake' | 'suburb';

// --- Estados de Tickets ---
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// --- Tipos de Reportes ---
export type ReportType = 'property' | 'agency';
export type ReportReason =
  | 'fraudulent'
  | 'inappropriate_content'
  | 'incorrect_information'
  | 'duplicate'
  | 'spam'
  | 'offensive'
  | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

// --- Usuario Base ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;

  // Datos comunes
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;

  // Para USER - límite de 1 propiedad
  propertyCount?: number;

  // Para AGENCY - datos de suscripción
  subscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  companyName?: string;
  companyLogo?: string;

  // Para PARTNER - datos de referidos
  referralCode?: string;
  totalCommissions?: number;
  pendingCommissions?: number;
  paidCommissions?: number;
  referredAgencies?: string[]; // IDs de agencias referidas
}

// --- Propiedad ---
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;

  // Ubicación
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Características
  propertyType: PropertyType;
  transactionType: TransactionType;
  locationType?: LocationType;
  bedrooms?: number;
  bathrooms?: number;
  area: number; // m2
  parkingSpaces?: number;

  // Media
  images: string[];
  videos?: string[];
  virtualTour?: string;

  // Dueño
  ownerId: string;
  ownerType: 'USER' | 'AGENCY';
  ownerName: string;

  // Estado
  status: PropertyStatus;
  rejectionReason?: string;

  // Moderación
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  moderatedBy?: string;
  moderatedAt?: Date;
  fieldViolations?: Array<{
    field: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  moderationNotes?: string;

  // Métricas
  views: number;
  likes: number;
  leads: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// --- Suscripción ---
export interface Subscription {
  id: string;
  agencyId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  // Datos de pago
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Fechas
  startDate: Date;
  endDate: Date;
  cancelledAt?: Date;

  // Referido
  referredBy?: string; // ID del PARTNER que refirió

  createdAt: Date;
  updatedAt: Date;
}

// --- Ticket de Soporte ---
export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;

  // Asignación
  assignedTo?: string; // ID del HELPDESK/ADMIN
  assignedToName?: string;

  // Mensajes
  messages: TicketMessage[];

  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
}

// --- Comisión ---
export interface Commission {
  id: string;
  partnerId: string;
  agencyId: string;
  subscriptionId: string;

  amount: number;
  percentage: number; // % de comisión
  status: 'pending' | 'paid' | 'cancelled';

  // Pago
  paidAt?: Date;
  paymentMethod?: string;
  transactionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

// --- Favoritos ---
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

// --- Permisos ---
export interface Permission {
  canCreateProperty: boolean;
  maxProperties: number | 'unlimited';
  canEditAllProperties: boolean;
  canDeleteAllProperties: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessTickets: boolean;
  canViewCommissions: boolean;
  canAccessConfig: boolean;
  canManageSubscriptions: boolean;
}

// --- Estadísticas ---
export interface PlatformStats {
  totalUsers: number;
  totalAgencies: number;
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface AgencyStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalLikes: number;
  totalLeads: number;
  conversionRate: number;
}

export interface PartnerStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
}

// --- Reporte ---
export interface Report {
  id: string;
  type: ReportType;
  reason: ReportReason;
  description: string;
  status: ReportStatus;

  // Información del reportante
  reporterId?: string; // null si es anónimo
  reporterName?: string;
  reporterEmail?: string;

  // Información del reportado
  propertyId?: string;
  propertyTitle?: string;
  agencyId?: string;
  agencyName?: string;

  // Revisión
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Acción tomada
  moderationAction?: 'none' | 'suspend_property' | 'suspend_user' | 'suspend_both';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
