// ============================================
// LIVINNING - Schemas de Validación: Property
// ============================================

import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(10, 'El título debe tener al menos 10 caracteres'),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  currency: z.string().default('USD'),

  // Ubicación
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
  country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
  zipCode: z.string(),

  // Características
  propertyType: z.enum(['house', 'apartment', 'land', 'commercial', 'office']),
  transactionType: z.enum(['sale', 'rent']),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive('El área debe ser mayor a 0'),
  parkingSpaces: z.number().int().nonnegative().optional(),

  // Media
  images: z.array(z.string().url()).min(1, 'Debes agregar al menos 1 imagen'),
  videos: z.array(z.string().url()).optional(),
  virtualTour: z.string().url().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFiltersSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  propertyType: z.enum(['house', 'apartment', 'land', 'commercial', 'office']).optional(),
  transactionType: z.enum(['sale', 'rent']).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minArea: z.number().nonnegative().optional(),
  maxArea: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  status: z.enum(['active', 'pending', 'rejected', 'inactive']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;
