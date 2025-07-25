import mongoose from 'mongoose'

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
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB')
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    console.error('❌ Failed to connect to MongoDB:', e)
    throw e
  }

  return cached!.conn
}

export default connectDB