// ============================================
// LIVINNING - Modelo User
// ============================================

import { ObjectId, Filter, UpdateFilter } from 'mongodb';
import { getCollection } from '../mongodb';
import { UserDocument } from '@/types/database';
import { User, UserRole } from '@/types';
import { COLLECTIONS } from '@/lib/utils/constants';

// --- Conversión de tipos ---

/**
 * Convierte un UserDocument de MongoDB a User (tipo de aplicación)
 */
export function userDocumentToUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    avatar: doc.avatar,
    phone: doc.phone,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastLogin: doc.lastLogin,
    isActive: doc.isActive,
    propertyCount: doc.propertyCount,
    subscriptionId: doc.subscriptionId?.toString(),
    subscriptionStatus: doc.subscriptionStatus,
    subscriptionPlan: doc.subscriptionPlan,
    subscriptionExpiresAt: doc.subscriptionExpiresAt,
    companyName: doc.companyName,
    companyLogo: doc.companyLogo,
    referralCode: doc.referralCode,
    totalCommissions: doc.totalCommissions,
    pendingCommissions: doc.pendingCommissions,
    paidCommissions: doc.paidCommissions,
    referredAgencies: doc.referredAgencies?.map(id => id.toString()),
  };
}

// --- Operaciones CRUD ---

/**
 * Encuentra un usuario por ID
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? userDocumentToUser(doc) : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Encuentra un usuario por email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const doc = await collection.findOne({ email: email.toLowerCase() });
    return doc ? userDocumentToUser(doc) : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Encuentra un usuario por código de referido
 */
export async function findUserByReferralCode(code: string): Promise<User | null> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const doc = await collection.findOne({ referralCode: code });
    return doc ? userDocumentToUser(doc) : null;
  } catch (error) {
    console.error('Error finding user by referral code:', error);
    return null;
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(
  userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);

  const now = new Date();
  const doc: Omit<UserDocument, '_id'> = {
    ...userData,
    email: userData.email.toLowerCase(),
    createdAt: now,
    updatedAt: now,
    isActive: true,
    propertyCount: 0,
  };

  const result = await collection.insertOne(doc as any);
  const newUser = await collection.findOne({ _id: result.insertedId });

  if (!newUser) {
    throw new Error('Error creating user');
  }

  return userDocumentToUser(newUser);
}

/**
 * Actualiza un usuario
 */
export async function updateUser(
  id: string,
  updates: Partial<Omit<UserDocument, '_id' | 'createdAt'>>
): Promise<User | null> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);

    const updateDoc: UpdateFilter<UserDocument> = {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateDoc,
      { returnDocument: 'after' }
    );

    return result ? userDocumentToUser(result) : null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Elimina un usuario (soft delete)
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Lista usuarios con filtros
 */
export async function listUsers(filters: {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: User[]; total: number }> {
  const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);

  const query: Filter<UserDocument> = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  return {
    users: docs.map(userDocumentToUser),
    total,
  };
}

/**
 * Incrementa el contador de propiedades de un usuario
 */
export async function incrementPropertyCount(userId: string): Promise<boolean> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { propertyCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing property count:', error);
    return false;
  }
}

/**
 * Decrementa el contador de propiedades de un usuario
 */
export async function decrementPropertyCount(userId: string): Promise<boolean> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { propertyCount: -1 },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error decrementing property count:', error);
    return false;
  }
}

/**
 * Actualiza el último login del usuario
 */
export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
}

/**
 * Verifica si un email ya existe
 */
export async function emailExists(email: string): Promise<boolean> {
  const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const count = await collection.countDocuments({ email: email.toLowerCase() });
  return count > 0;
}

/**
 * Verifica si un código de referido ya existe
 */
export async function referralCodeExists(code: string): Promise<boolean> {
  const collection = await getCollection<UserDocument>(COLLECTIONS.USERS);
  const count = await collection.countDocuments({ referralCode: code });
  return count > 0;
}

/**
 * Genera un código de referido único
 */
export async function generateUniqueReferralCode(baseName: string): Promise<string> {
  const baseCode = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8);

  let code = baseCode;
  let counter = 1;

  while (await referralCodeExists(code)) {
    code = `${baseCode}${counter}`;
    counter++;
  }

  return code;
}
