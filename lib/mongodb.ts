import mongoose from 'mongoose';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = globalThis.mongoose || {
  conn: null,
  promise: null,
};

if (!globalThis.mongoose) {
  globalThis.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // Check for MONGODB_URI at connection time, not at module load time
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }
  if (!cached.promise) {
    console.log('Creating new MongoDB connection...');
    console.log(
      'Connection URI (masked):',
      MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
    );
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        cached.promise = null; // Reset promise on error
        throw error;
      });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    throw error;
  }
}

export default dbConnect;
