import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use globalThis for better compatibility with serverless environments
declare global {
  var __mongoose: MongooseCache | undefined;
}

let cached = globalThis.__mongoose;

if (!cached) {
  cached = globalThis.__mongoose = { conn: null, promise: null };
}

async function connect() {
  // Return existing connection if available
  if (cached!.conn) {
    return cached!.conn;
  }

  // If no connection promise exists, create one
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      // Add additional options for better serverless compatibility
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      // Clear the promise on error to allow retry
      cached!.promise = null;
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    // Clear the promise on error to allow retry
    cached!.promise = null;
    throw error;
  }
}

export default connect;
