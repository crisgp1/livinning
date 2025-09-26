import mongoose from 'mongoose'
import logger from '@/lib/utils/logger'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseGlobal: GlobalMongoose | undefined
}

let cached = global.mongooseGlobal

if (!cached) {
  cached = global.mongooseGlobal = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached!.conn) {
    logger.debug('Database', 'Using existing MongoDB connection')
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    logger.info('Database', 'Establishing MongoDB connection')
    const connectionTimer = logger.startTimer('MongoDB Connection')

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      connectionTimer()
      logger.database('Database', 'Connected successfully', {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      })
      
      // Add connection event listeners
      mongoose.connection.on('error', (err) => {
        logger.error('Database', 'MongoDB connection error', err)
      })
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('Database', 'MongoDB disconnected')
      })
      
      mongoose.connection.on('reconnected', () => {
        logger.info('Database', 'MongoDB reconnected')
      })
      
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    logger.error('Database', 'Failed to connect to MongoDB', e)
    throw e
  }

  return cached!.conn
}

// Legacy export name for backwards compatibility
export const connectToDatabase = connectDB

export default connectDB