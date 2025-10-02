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
  TicketStatus,
  TicketPriority
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
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  parkingSpaces?: number;

  // Media
  images: string[];
  videos?: string[];
  virtualTour?: string;

  // Dueño
  ownerId: ObjectId;
  ownerType: 'USER' | 'AGENCY';
  ownerName: string;

  // Estado
  status: PropertyStatus;
  rejectionReason?: string;

  // Métricas
  views: number;
  likes: number;
  leads: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
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
  ]
};
