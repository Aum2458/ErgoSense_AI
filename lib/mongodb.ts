import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache || { conn: null, promise: null };

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('your_mongodb')) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 4000,
      })
      .then((m) => {
        console.log('[MongoDB] Connected to MongoDB Atlas');
        return m;
      })
      .catch((err) => {
        console.warn('[MongoDB] Connection unavailable, using in-memory store:', err.message);
        cached.promise = null;
        return null as any;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}
