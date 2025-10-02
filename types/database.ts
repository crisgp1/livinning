// ============================================
// LIVINNING - Tipos para Base de Datos (MongoDB)
// ============================================

import { ObjectId } from 'mongodb';
import {
  UserRole,
  SubscriptionStatus,
  SubscriptionPlan,
  PropertyStatus,
  PropertyType,
  TransactionType,
  LocationType,
  TicketStatus,
  TicketPriority,
  ReportType,
  ReportReason,
  ReportStatus
} from './index';

// --- Documentos de MongoDB ---

export interface UserDocument {
  _id: ObjectId;
  email: string;
  password: string; // Hash
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;

  // Datos comunes
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  isSuspended?: boolean;
  suspendedAt?: Date;
  suspendedBy?: string; // Clerk ID del admin que suspendió
  suspensionReason?: string;

  // Para USER
  propertyCount?: number;

  // Para AGENCY
  subscriptionId?: ObjectId;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: Date;
  companyName?: string;
  companyLogo?: string;

  // Para PARTNER
  referralCode?: string;
  totalCommissions?: number;
  pendingCommissions?: number;
  paidCommissions?: number;
  referredAgencies?: ObjectId[];
}

export interface PropertyDocument {
  _id: ObjectId;
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
  area: number;
  parkingSpaces?: number;

  // Media
  images: string[];
  videos?: string[];
  virtualTour?: string;

  // Dueño
  ownerId: string; // Clerk user ID
  ownerType: 'USER' | 'AGENCY';
  ownerName: string;

  // Estado
  status: PropertyStatus;
  rejectionReason?: string;

  // Moderación
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  moderatedBy?: string; // Clerk ID del admin
  moderatedAt?: Date;
  fieldViolations?: PropertyFieldViolation[];
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

export interface PropertyFieldViolation {
  field: string; // Nombre del campo con violación
  message: string; // Comentario del admin sobre la violación
  severity: 'low' | 'medium' | 'high';
}

export interface PropertyModerationDocument {
  _id: ObjectId;
  propertyId: ObjectId;
  propertyTitle: string;
  ownerId: string; // Clerk ID del dueño
  ownerName: string;

  // Resultado de moderación
  action: 'approve' | 'reject' | 'request_corrections';
  fieldViolations?: PropertyFieldViolation[];
  generalNotes?: string;

  // Admin que moderó
  moderatedBy: string; // Clerk ID
  moderatedByName: string;
  moderatedAt: Date;

  // Notificación enviada
  notificationSent: boolean;
  notificationId?: ObjectId;

  createdAt: Date;
}

export interface SubscriptionDocument {
  _id: ObjectId;
  agencyId: ObjectId;
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
  referredBy?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDocument {
  _id: ObjectId;
  userId: ObjectId;
  userName: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;

  // Asignación
  assignedTo?: ObjectId;
  assignedToName?: string;

  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface TicketMessageDocument {
  _id: ObjectId;
  ticketId: ObjectId;
  userId: ObjectId;
  userName: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface CommissionDocument {
  _id: ObjectId;
  partnerId: ObjectId;
  agencyId: ObjectId;
  subscriptionId: ObjectId;

  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'cancelled';

  // Pago
  paidAt?: Date;
  paymentMethod?: string;
  transactionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteDocument {
  _id: ObjectId;
  userId: ObjectId;
  propertyId: ObjectId;
  createdAt: Date;
}

export interface UserNotificationDocument {
  _id: ObjectId;
  userId: string; // Clerk user ID
  type: 'warning' | 'violation' | 'suspension' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdBy: string; // Clerk ID del admin
  createdByName: string;
  createdAt: Date;
  readAt?: Date;
}

// --- Índices sugeridos ---
export const MONGODB_INDEXES = {
  users: [
    { email: 1 },
    { role: 1 },
    { referralCode: 1 },
    { 'createdAt': -1 }
  ],
  properties: [
    { ownerId: 1 },
    { status: 1 },
    { city: 1, state: 1 },
    { propertyType: 1, transactionType: 1 },
    { price: 1 },
    { 'createdAt': -1 }
  ],
  subscriptions: [
    { agencyId: 1 },
    { status: 1 },
    { referredBy: 1 }
  ],
  tickets: [
    { userId: 1 },
    { assignedTo: 1 },
    { status: 1 },
    { 'createdAt': -1 }
  ],
  ticketMessages: [
    { ticketId: 1 },
    { 'createdAt': 1 }
  ],
  commissions: [
    { partnerId: 1 },
    { agencyId: 1 },
    { status: 1 }
  ],
  favorites: [
    { userId: 1, propertyId: 1 }
  ],
  userNotifications: [
    { userId: 1, isRead: 1 },
    { 'createdAt': -1 }
  ],
  reports: [
    { status: 1 },
    { type: 1 },
    { propertyId: 1 },
    { agencyId: 1 },
    { 'createdAt': -1 }
  ]
};

// --- Reporte Document ---
export interface ReportDocument {
  _id: ObjectId;
  type: ReportType;
  reason: ReportReason;
  description: string;
  status: ReportStatus;

  // Información del reportante
  reporterId?: string; // Clerk ID, null si es anónimo
  reporterName?: string;
  reporterEmail?: string;

  // Información del reportado
  propertyId?: string; // Property ID string
  propertyTitle?: string;
  agencyId?: string; // Clerk ID de la agencia
  agencyName?: string;

  // Revisión
  reviewedBy?: string; // Clerk ID del admin
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Acción tomada
  moderationAction?: 'none' | 'suspend_property' | 'suspend_user' | 'suspend_both';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// --- Service Order Document ---
export interface ServiceOrderDocument {
  _id: ObjectId;
  orderNumber: string;

  // Cliente
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  // Servicio
  serviceType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';

  // Ubicación
  address: string;
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Partner
  partnerId?: string;
  partnerName?: string;
  assignedAt?: Date;
  assignedBy?: string;

  // Estado
  status: string;

  // Pago
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentId?: string;
  paidAt?: Date;
  releasedAt?: Date;

  // Fechas
  scheduledDate?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Evidencia
  beforePhotos?: string[];
  afterPhotos?: string[];
  partnerNotes?: string;

  // Monitoreo HELPDESK
  helpdeskNotes?: string;
  lastContactedAt?: Date;
  contactedBy?: string;

  // Calificación
  rating?: number;
  customerReview?: string;

  createdAt: Date;
  updatedAt: Date;
}

// --- Partner Credit Document ---
export interface PartnerCreditDocument {
  _id: ObjectId;
  partnerId: string;
  partnerName: string;

  amount: number;
  reason: string;
  notes?: string;

  grantedBy: string;
  grantedByName: string;
  grantedAt: Date;

  used: boolean;
  usedAt?: Date;
  usedForOrderId?: string;

  expiresAt?: Date;
  createdAt: Date;
}
