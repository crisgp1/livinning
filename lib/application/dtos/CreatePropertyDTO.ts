import { z } from 'zod'
import { PropertyTypeEnum } from '../../domain/value-objects/PropertyType'

export const CreatePropertyDTOSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  price: z.object({
    amount: z.number().min(1, 'Price must be greater than 0'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('EUR')
  }),
  propertyType: z.nativeEnum(PropertyTypeEnum, {
    errorMap: () => ({ message: 'Invalid property type' })
  }),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    country: z.string().min(2, 'Country is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }),
  features: z.object({
    bedrooms: z.number().min(0, 'Bedrooms cannot be negative').max(20, 'Too many bedrooms'),
    bathrooms: z.number().min(0, 'Bathrooms cannot be negative').max(20, 'Too many bathrooms'),
    squareMeters: z.number().min(10, 'Square meters must be at least 10').max(10000, 'Square meters too large'),
    lotSize: z.number().min(1, 'Lot size must be positive').optional(),
    yearBuilt: z.number().min(1800, 'Year built too old').max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
    parking: z.number().min(0, 'Parking cannot be negative').max(20, 'Too many parking spaces').optional(),
    amenities: z.array(z.string().min(1, 'Amenity cannot be empty')).default([])
  }),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(20, 'Too many images'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required')
})

export type CreatePropertyDTO = z.infer<typeof CreatePropertyDTOSchema>

export const UpdatePropertyDTOSchema = CreatePropertyDTOSchema.partial().extend({
  id: z.string().min(1, 'Property ID is required')
})

export type UpdatePropertyDTO = z.infer<typeof UpdatePropertyDTOSchema>