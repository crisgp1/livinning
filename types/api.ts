// ============================================
// LIVINNING - Tipos para API
// ============================================

import { User, Property, UserRole } from './index';

// --- Respuestas de API ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;

  // Para AGENCY
  companyName?: string;

  // Para PARTNER
  referralCode?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// --- Propiedades ---
export interface CreatePropertyRequest {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  propertyType: string;
  transactionType: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  parkingSpaces?: number;
  images: string[];
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  status?: string;
}

export interface PropertyFilters {
  city?: string;
  state?: string;
  propertyType?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  ownerId?: string;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Usuarios ---
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
  companyLogo?: string;
}

export interface UserListFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// --- Suscripciones ---
export interface CreateSubscriptionRequest {
  plan: string;
  paymentMethodId: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

// --- Tickets ---
export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: string;
}

export interface UpdateTicketRequest {
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export interface AddTicketMessageRequest {
  message: string;
  attachments?: string[];
}

// --- Comisiones ---
export interface CommissionFilters {
  partnerId?: string;
  agencyId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

// --- Paginación ---
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// --- Analíticas ---
export interface AnalyticsRequest {
  startDate?: Date;
  endDate?: Date;
  granularity?: 'day' | 'week' | 'month';
}

export interface AnalyticsResponse {
  views: number[];
  likes: number[];
  leads: number[];
  conversions: number[];
  labels: string[];
}
