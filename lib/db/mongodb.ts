// ============================================
// LIVINNING - Conexión MongoDB
// ============================================

import { MongoClient, Db, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// En desarrollo, usar variable global para evitar múltiples conexiones
// por hot-reload de Next.js
if (process.env.NODE_ENV === 'development') {
  // Extender el objeto global de Node.js
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) {
      throw new Error('Por favor agrega MONGODB_URI en .env.local');
    }
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En producción, crear nueva conexión
  if (!uri) {
    throw new Error('Por favor agrega MONGODB_URI en .env.local');
  }
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Obtiene el cliente de MongoDB
 */
export default clientPromise;

/**
 * Obtiene la base de datos de MongoDB
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME || 'livinning');
}

/**
 * Helper para obtener una colección específica
 */
export async function getCollection<T extends Document = Document>(collectionName: string) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Verifica la conexión a MongoDB
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Conexión a MongoDB exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    return false;
  }
}

/**
 * Cierra la conexión a MongoDB
 */
export async function closeConnection(): Promise<void> {
  try {
    const client = await clientPromise;
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}
