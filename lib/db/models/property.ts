// ============================================
// LIVINNING - Modelo Property
// ============================================

import { ObjectId, Filter } from 'mongodb';
import { getCollection } from '../mongodb';
import { PropertyDocument } from '@/types/database';
import { Property, PropertyStatus } from '@/types';
import { COLLECTIONS } from '@/lib/utils/constants';

// --- Conversión de tipos ---

/**
 * Convierte un PropertyDocument de MongoDB a Property (tipo de aplicación)
 */
export function propertyDocumentToProperty(doc: PropertyDocument): Property {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    currency: doc.currency,
    address: doc.address,
    city: doc.city,
    state: doc.state,
    country: doc.country,
    zipCode: doc.zipCode,
    coordinates: doc.coordinates,
    propertyType: doc.propertyType,
    transactionType: doc.transactionType,
    locationType: doc.locationType,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    area: doc.area,
    parkingSpaces: doc.parkingSpaces,
    images: doc.images,
    videos: doc.videos,
    virtualTour: doc.virtualTour,
    ownerId: doc.ownerId, // Already a string (Clerk user ID)
    ownerType: doc.ownerType,
    ownerName: doc.ownerName,
    status: doc.status,
    rejectionReason: doc.rejectionReason,
    moderationStatus: doc.moderationStatus,
    moderatedBy: doc.moderatedBy,
    moderatedAt: doc.moderatedAt,
    fieldViolations: doc.fieldViolations,
    moderationNotes: doc.moderationNotes,
    views: doc.views,
    likes: doc.likes,
    leads: doc.leads,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt,
  };
}

// --- Operaciones CRUD ---

/**
 * Encuentra una propiedad por ID
 */
export async function findPropertyById(id: string): Promise<Property | null> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? propertyDocumentToProperty(doc) : null;
  } catch (error) {
    console.error('Error finding property by ID:', error);
    return null;
  }
}

/**
 * Crea una nueva propiedad
 */
export async function createProperty(
  propertyData: Omit<PropertyDocument, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'leads'>
): Promise<Property> {
  const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

  const now = new Date();
  const doc: Omit<PropertyDocument, '_id'> = {
    ...propertyData,
    views: 0,
    likes: 0,
    leads: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as any);
  const newProperty = await collection.findOne({ _id: result.insertedId });

  if (!newProperty) {
    throw new Error('Error creating property');
  }

  return propertyDocumentToProperty(newProperty);
}

/**
 * Actualiza una propiedad
 */
export async function updateProperty(
  id: string,
  updates: Partial<Omit<PropertyDocument, '_id' | 'createdAt' | 'ownerId'>>
): Promise<Property | null> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result ? propertyDocumentToProperty(result) : null;
  } catch (error) {
    console.error('Error updating property:', error);
    return null;
  }
}

/**
 * Elimina una propiedad
 */
export async function deleteProperty(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
}

/**
 * Lista propiedades con filtros
 */
export async function listProperties(filters: {
  city?: string;
  state?: string;
  propertyType?: string;
  transactionType?: string;
  locationType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: PropertyStatus;
  ownerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ properties: Property[]; total: number }> {
  const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

  const query: Filter<PropertyDocument> = {};

  if (filters.city) {
    query.city = { $regex: filters.city, $options: 'i' };
  }

  if (filters.state) {
    query.state = { $regex: filters.state, $options: 'i' };
  }

  if (filters.propertyType) {
    query.propertyType = filters.propertyType as any;
  }

  if (filters.transactionType) {
    query.transactionType = filters.transactionType as any;
  }

  if (filters.locationType) {
    query.locationType = filters.locationType as any;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      (query.price as any).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (query.price as any).$lte = filters.maxPrice;
    }
  }

  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    query.area = {};
    if (filters.minArea !== undefined) {
      (query.area as any).$gte = filters.minArea;
    }
    if (filters.maxArea !== undefined) {
      (query.area as any).$lte = filters.maxArea;
    }
  }

  if (filters.bedrooms) {
    query.bedrooms = { $gte: filters.bedrooms };
  }

  if (filters.bathrooms) {
    query.bathrooms = { $gte: filters.bathrooms };
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.ownerId) {
    query.ownerId = filters.ownerId; // Clerk user ID (string)
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

  const [docs, total] = await Promise.all([
    collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  return {
    properties: docs.map(propertyDocumentToProperty),
    total,
  };
}

/**
 * Incrementa el contador de vistas de una propiedad
 */
export async function incrementPropertyViews(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
}

/**
 * Incrementa el contador de likes de una propiedad
 */
export async function incrementPropertyLikes(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing likes:', error);
    return false;
  }
}

/**
 * Decrementa el contador de likes de una propiedad
 */
export async function decrementPropertyLikes(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: -1 } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error decrementing likes:', error);
    return false;
  }
}

/**
 * Incrementa el contador de leads de una propiedad
 */
export async function incrementPropertyLeads(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { leads: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing leads:', error);
    return false;
  }
}

/**
 * Cambia el estado de una propiedad
 */
export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus,
  rejectionReason?: string
): Promise<Property | null> {
  try {
    const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'active') {
      updates.publishedAt = new Date();
      updates.rejectionReason = null;
    }

    if (status === 'rejected' && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    return result ? propertyDocumentToProperty(result) : null;
  } catch (error) {
    console.error('Error updating property status:', error);
    return null;
  }
}

/**
 * Cuenta propiedades de un usuario
 */
export async function countUserProperties(userId: string): Promise<number> {
  const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);
  return await collection.countDocuments({ ownerId: userId }); // Clerk user ID (string)
}

/**
 * Obtiene propiedades pendientes de aprobación
 */
export async function getPendingProperties(
  page: number = 1,
  limit: number = 20
): Promise<{ properties: Property[]; total: number }> {
  return listProperties({
    status: 'pending',
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });
}

/**
 * Busca propiedades por texto
 */
export async function searchProperties(
  searchText: string,
  filters?: {
    city?: string;
    propertyType?: string;
    transactionType?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }
): Promise<{ properties: Property[]; total: number }> {
  const collection = await getCollection<PropertyDocument>(COLLECTIONS.PROPERTIES);

  const query: Filter<PropertyDocument> = {
    status: 'active',
    $or: [
      { title: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
      { city: { $regex: searchText, $options: 'i' } },
      { state: { $regex: searchText, $options: 'i' } },
    ],
  };

  // Agregar filtros adicionales
  if (filters?.city) {
    query.city = { $regex: filters.city, $options: 'i' };
  }

  if (filters?.propertyType) {
    query.propertyType = filters.propertyType as any;
  }

  if (filters?.transactionType) {
    query.transactionType = filters.transactionType as any;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      (query.price as any).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (query.price as any).$lte = filters.maxPrice;
    }
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  return {
    properties: docs.map(propertyDocumentToProperty),
    total,
  };
}
